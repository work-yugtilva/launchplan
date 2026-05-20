import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const MIN_INPUT_LENGTH = 10
const MAX_INPUT_LENGTH = 2000
const AGENT_TOTAL_STEPS = 40

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

    return NextResponse.json({ run_id: runId }, { status: 201 })
  } catch (error) {
    console.error('[agent POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
