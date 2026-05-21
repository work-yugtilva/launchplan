import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'
import { validateCronSecret } from '@/app/lib/ai/utils/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { week_start } = body
  if (!week_start) {
    return NextResponse.json({ error: 'week_start required' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin as any

  const { data: run, error: runError } = await admin
    .from('insight_pipeline_runs')
    .select('id')
    .eq('week_start', week_start)
    .single()

  if (runError) return NextResponse.json({ error: 'Run not found' }, { status: 404 })

  const { data: approved, error: approvedError } = await admin
    .from('insight_candidates')
    .select('editor_output')
    .eq('pipeline_run_id', run.id)
    .eq('status', 'approved')

  if (approvedError) return NextResponse.json({ error: approvedError.message }, { status: 500 })
  if (!approved?.length) {
    return NextResponse.json({ error: 'No approved candidates' }, { status: 400 })
  }

  const rows = approved.map((c: { editor_output: Record<string, unknown> }) => ({
    title: c.editor_output.title,
    metric_label: c.editor_output.metric_label,
    metric_value: c.editor_output.metric_value,
    metric_period: c.editor_output.metric_period,
    description: c.editor_output.description,
    insight_type: c.editor_output.insight_type,
    source_label: c.editor_output.source_label,
    builder_relevance: c.editor_output.builder_relevance,
    newsletter_safe: c.editor_output.newsletter_safe,
    confidence_band: c.editor_output.confidence_band,
  }))

  // Insert new rows first — if this fails, production data is untouched
  const insertTimestamp = new Date().toISOString()
  const { error: insertError } = await admin.from('market_insights').insert(rows)
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  // Delete old rows only after successful insert
  await admin.from('market_insights').delete().lt('created_at', insertTimestamp)

  return NextResponse.json({ success: true, published_count: rows.length })
}
