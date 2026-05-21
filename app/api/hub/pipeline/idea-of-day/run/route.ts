import { NextResponse, after } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'
import { validateCronSecret } from '@/app/lib/ai/utils/auth'
import { getTodayUTC } from '@/app/lib/ai/utils/date'
import { runDailyIdeaPipeline } from '@/app/lib/ai/pipelines/runDailyIdeaPipeline'

export const dynamic = 'force-dynamic'

// Intended: daily 09:00 UTC
export async function POST(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin as any
  const runDate = getTodayUTC()

  // Idempotency check
  const { data: existing } = await admin
    .from('idea_pipeline_runs')
    .select('id, status')
    .eq('run_date', runDate)
    .maybeSingle()

  if (existing?.status === 'completed') {
    return NextResponse.json({ skipped: true, run_id: existing.id }, { status: 200 })
  }

  let runId: string
  if (existing) {
    runId = existing.id
    await admin
      .from('idea_pipeline_runs')
      .update({ status: 'pending' })
      .eq('id', runId)
  } else {
    const { data: newRun, error } = await admin
      .from('idea_pipeline_runs')
      .insert({ run_date: runDate, status: 'pending' })
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    runId = newRun.id
  }

  after(() => runDailyIdeaPipeline(runId, runDate).catch((e) => console.error('[idea-of-day/run]', e)))

  return NextResponse.json({ success: true, skipped: false, run_id: runId }, { status: 201 })
}
