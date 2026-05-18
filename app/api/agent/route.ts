import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'
import type { AgentRun, Database, Profile } from '@/app/lib/types'

type AgentRunInsert = Database['public']['Tables']['agent_runs']['Insert']

export const dynamic = 'force-dynamic'

const MIN_INPUT_LENGTH = 10
const MAX_INPUT_LENGTH = 2000
const AGENT_TOTAL_STEPS = 40
const MONTHLY_RUN_LIMITS: Record<string, number> = {
  free: 1,
  pro: 10,
  empire: Infinity,
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

    const { data: profileRow } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const profile = profileRow as Pick<Profile, 'plan'> | null

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const { count: runCount } = await supabase
      .from('agent_runs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', monthStart.toISOString())

    const plan = profile?.plan ?? 'free'
    const limit = MONTHLY_RUN_LIMITS[plan] ?? 1
    const used = runCount ?? 0

    if (used >= limit) {
      return NextResponse.json(
        { error: 'Monthly agent run limit reached', limit, used, plan },
        { status: 403 }
      )
    }

    const payload: AgentRunInsert = {
      user_id: user.id,
      idea_input: idea_input.trim(),
      status: 'pending',
      steps_done: 0,
      total_steps: AGENT_TOTAL_STEPS,
    }

    const { data: newRow, error } = await supabaseAdmin
      .from('agent_runs')
      .insert(payload as never)
      .select('id')
      .single()

    if (error) throw error

    const inserted = newRow as Pick<AgentRun, 'id'>

    return NextResponse.json({ run_id: inserted.id }, { status: 201 })
  } catch (error) {
    console.error('[agent POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
