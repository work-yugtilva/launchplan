import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'
import { validateCronSecret } from '@/app/lib/ai/utils/auth'
import { getWeekStartUTC } from '@/app/lib/ai/utils/date'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin as any
  const weekStart = getWeekStartUTC()

  const { data: run, error: runError } = await admin
    .from('trend_pipeline_runs')
    .select('*')
    .eq('week_start', weekStart)
    .maybeSingle()

  if (runError) return NextResponse.json({ error: runError.message }, { status: 500 })
  if (!run) return NextResponse.json({ run: null, candidates: [] })

  const { data: candidates, error: candidatesError } = await admin
    .from('trend_candidates')
    .select('*')
    .eq('pipeline_run_id', run.id)
    .order('created_at', { ascending: true })

  if (candidatesError) return NextResponse.json({ error: candidatesError.message }, { status: 500 })

  return NextResponse.json({ run, candidates })
}
