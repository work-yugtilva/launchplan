import { NextResponse, after } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'
import { validateCronSecret } from '@/app/lib/ai/utils/auth'
import { getWeekStartUTC } from '@/app/lib/ai/utils/date'
import { runWeeklyInsightsPipeline } from '@/app/lib/ai/pipelines/runWeeklyInsightsPipeline'

export const dynamic = 'force-dynamic'

// Intended: Monday 06:30 UTC
export async function POST(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin as any
  const weekStart = getWeekStartUTC()

  const { data: existing } = await admin
    .from('insight_pipeline_runs')
    .select('id, status')
    .eq('week_start', weekStart)
    .maybeSingle()

  if (existing?.status === 'completed') {
    return NextResponse.json({ skipped: true, run_id: existing.id }, { status: 200 })
  }

  let runId: string
  if (existing) {
    runId = existing.id
    await admin
      .from('insight_pipeline_runs')
      .update({ status: 'pending' })
      .eq('id', runId)
  } else {
    const { data: newRun, error } = await admin
      .from('insight_pipeline_runs')
      .insert({ week_start: weekStart, status: 'pending' })
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    runId = newRun.id
  }

  after(() => runWeeklyInsightsPipeline(runId, weekStart).catch((e) => console.error('[insights/run]', e)))

  return NextResponse.json({ success: true, skipped: false, run_id: runId }, { status: 201 })
}
