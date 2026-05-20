import { NextResponse, after } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const MIN_INPUT_LENGTH = 10
const MAX_INPUT_LENGTH = 2000
const AGENT_TOTAL_STEPS = 40
const ANALYSIS_TIMEOUT_MS = 100_000

const SYSTEM_PROMPT = `You are an expert PM validation agent. Analyze startup ideas and return structured JSON.

Respond with ONLY valid JSON matching this exact structure — no markdown, no commentary:
{
  "summary": "2-3 sentence overview of the idea and its core value proposition",
  "scores": {
    "opportunity": <integer 0-100>,
    "problem": <integer 0-100>,
    "feasibility": <integer 0-100>,
    "timing": <integer 0-100>,
    "pm_fit": <integer 0-100>
  },
  "verdict": "<one of: strong | promising | risky | pass>",
  "risks": ["risk 1", "risk 2", "risk 3"],
  "next_steps": ["step 1", "step 2", "step 3"],
  "market_size": "estimated market size with a specific data point",
  "target_user": "specific description of the primary target user"
}

Scoring rubric:
- opportunity: market size, growth, addressable pain
- problem: severity, frequency, inadequacy of current solutions
- feasibility: technical complexity, resources required, time to MVP
- timing: market readiness, technology maturity, competitive landscape
- pm_fit: how well this matches PM skillset, product-led growth potential

Verdict rubric:
- strong: average score >= 75
- promising: average score >= 60
- risky: average score >= 45
- pass: average score < 45`

async function runAnalysis(runId: string, ideaInput: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin as any
  let settled = false
  let currentSteps = 2

  async function settle(
    status: 'completed' | 'failed',
    steps: number,
    result?: unknown,
  ) {
    if (settled) return
    settled = true
    clearInterval(progressInterval)
    clearTimeout(watchdog)
    try {
      await admin
        .from('agent_runs')
        .update({ status, steps_done: steps, ...(result !== undefined ? { result } : {}) })
        .eq('id', runId)
    } catch (e) {
      console.error('[agent settle]', e)
    }
  }

  await admin
    .from('agent_runs')
    .update({ status: 'running', steps_done: currentSteps })
    .eq('id', runId)

  const progressInterval = setInterval(async () => {
    if (settled) return
    currentSteps = Math.min(currentSteps + 3, 35)
    try {
      await admin.from('agent_runs').update({ steps_done: currentSteps }).eq('id', runId)
    } catch { /* ignore transient failures */ }
  }, 3500)

  const watchdog = setTimeout(() => {
    console.error('[agent analysis] watchdog timeout for run', runId)
    void settle('failed', 0)
  }, ANALYSIS_TIMEOUT_MS)

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Analyze this startup idea:\n\n${ideaInput}` }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in model response')

    const result = JSON.parse(jsonMatch[0])
    await settle('completed', AGENT_TOTAL_STEPS, result)

  } catch (err) {
    console.error('[agent analysis]', err)
    await settle('failed', 0)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { idea_input } = body

    if (
      !idea_input ||
      typeof idea_input !== 'string' ||
      idea_input.trim().length < MIN_INPUT_LENGTH ||
      idea_input.trim().length > MAX_INPUT_LENGTH
    ) {
      return NextResponse.json(
        { error: `idea_input must be between ${MIN_INPUT_LENGTH} and ${MAX_INPUT_LENGTH} characters` },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminRpc = (supabaseAdmin as any).rpc.bind(supabaseAdmin)
    const { data: runId, error: rpcError } = await adminRpc('create_agent_run', {
      p_user_id:     user.id,
      p_idea_input:  idea_input.trim(),
      p_total_steps: AGENT_TOTAL_STEPS,
    })

    if (rpcError) {
      if (rpcError.message?.includes('QUOTA_EXCEEDED')) {
        const parts = Object.fromEntries(
          rpcError.message.split(':').slice(1).map((p: string) => p.split('='))
        )
        return NextResponse.json(
          { error: 'Monthly agent run limit reached', ...parts },
          { status: 403 }
        )
      }
      throw rpcError
    }

    // Kick off analysis after response is sent
    after(() => runAnalysis(runId as string, idea_input.trim()))

    return NextResponse.json({ run_id: runId }, { status: 201 })
  } catch (error) {
    console.error('[agent POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
