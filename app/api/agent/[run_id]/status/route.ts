import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import type { AgentRun, AgentStatusResponse } from '@/app/lib/types'

type AgentRunStatusRow = Pick<
  AgentRun,
  'id' | 'status' | 'steps_done' | 'total_steps' | 'result' | 'user_id'
>

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  context: { params: Promise<{ run_id: string }> }
) {
  try {
    const { run_id } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data: row, error } = await supabase
      .from('agent_runs')
      .select('id, status, steps_done, total_steps, result, user_id')
      .eq('id', run_id)
      .limit(1)
      .single()

    if (error || !row) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    const run = row as AgentRunStatusRow

    if (run.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const response: AgentStatusResponse = {
      status: run.status,
      steps_done: run.steps_done,
      total_steps: run.total_steps,
      result: run.result ?? null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[agent/status]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
