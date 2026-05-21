import { z } from 'zod'
import { supabaseAdmin } from '@/app/lib/supabase/admin'
import { callAnthropic, extractJson } from '@/app/lib/ai/anthropic'
import { getSystemPrompt as scoutSystem, getUserPrompt as scoutUser } from '@/app/lib/ai/prompts/weekly-trends-scout'
import { getSystemPrompt as editorSystem, getUserPrompt as editorUser } from '@/app/lib/ai/prompts/weekly-trends-editor'

const ScoutCandidateSchema = z.object({
  keyword: z.string(),
  category: z.enum(['AI', 'Developer Tools', 'SaaS', 'Consumer', 'Infrastructure', 'Other']),
  headline: z.string(),
  why_it_matters: z.string(),
  product_implication: z.string(),
  estimated_growth: z.string(),
  trend_type: z.enum(['emerging', 'accelerating', 'peaking', 'declining']),
  confidence: z.number().int().min(0).max(100),
})

const ScoutOutputSchema = z.array(ScoutCandidateSchema).min(1)

const EditorCandidateSchema = z.object({
  candidate_index: z.number().int().min(0),
  keyword: z.string(),
  category: z.enum(['AI', 'Developer Tools', 'SaaS', 'Consumer', 'Infrastructure', 'Other']),
  headline: z.string(),
  description: z.string(),
  builder_takeaway: z.string(),
  why_it_matters: z.string(),
  product_implication: z.string(),
  trend_type: z.enum(['emerging', 'accelerating', 'peaking', 'declining']),
})

const EditorOutputSchema = z.array(EditorCandidateSchema).min(1)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const admin = supabaseAdmin as any

export interface WeeklyTrendsPipelineResult {
  candidateCount: number
  approvedCount: number
}

export async function runWeeklyTrendsPipeline(
  runId: string,
  weekStart: string,
): Promise<WeeklyTrendsPipelineResult> {
  await admin
    .from('trend_pipeline_runs')
    .update({ status: 'running' })
    .eq('id', runId)

  try {
    // Scout stage
    const scoutText = await callAnthropic({
      systemPrompt: scoutSystem(),
      userPrompt: scoutUser({ weekStart }),
      maxTokens: 4000,
    })

    let candidates: z.infer<typeof ScoutCandidateSchema>[]
    try {
      candidates = ScoutOutputSchema.parse(extractJson(scoutText))
    } catch (err) {
      console.error('[runWeeklyTrendsPipeline] scout parse error', err)
      await admin
        .from('trend_pipeline_runs')
        .update({ status: 'failed', error_message: 'Scout output parse failed' })
        .eq('id', runId)
      throw err
    }

    // Insert candidates
    const candidateRows = candidates.map((c) => ({
      pipeline_run_id: runId,
      scout_output: c,
      status: 'pending' as const,
    }))
    const { data: insertedCandidates, error: insertError } = await admin
      .from('trend_candidates')
      .insert(candidateRows)
      .select('id')
    if (insertError) throw insertError

    await admin
      .from('trend_pipeline_runs')
      .update({ candidate_count: candidates.length })
      .eq('id', runId)

    // Editor stage
    const editorText = await callAnthropic({
      systemPrompt: editorSystem(),
      userPrompt: editorUser({ candidates, weekStart }),
      maxTokens: 4000,
    })

    let editorOutput: z.infer<typeof EditorCandidateSchema>[]
    try {
      editorOutput = EditorOutputSchema.parse(extractJson(editorText))
    } catch (err) {
      console.error('[runWeeklyTrendsPipeline] editor parse error', err)
      await admin
        .from('trend_pipeline_runs')
        .update({ status: 'failed', error_message: 'Editor output parse failed' })
        .eq('id', runId)
      throw err
    }

    // Update approved candidates with editor output
    const approvedIds: string[] = []
    for (const item of editorOutput) {
      if (item.candidate_index >= insertedCandidates.length) {
        throw new Error(`Editor candidate_index ${item.candidate_index} out of bounds (${insertedCandidates.length} candidates)`)
      }
      const candidateId: string = insertedCandidates[item.candidate_index].id
      approvedIds.push(candidateId)
      await admin
        .from('trend_candidates')
        .update({ editor_output: item, status: 'approved' })
        .eq('id', candidateId)
    }

    // Reject remaining candidates
    const loserIds = insertedCandidates
      .map((c: { id: string }) => c.id)
      .filter((id: string) => !approvedIds.includes(id))
    if (loserIds.length > 0) {
      await admin
        .from('trend_candidates')
        .update({ status: 'rejected' })
        .in('id', loserIds)
    }

    await admin
      .from('trend_pipeline_runs')
      .update({ status: 'completed' })
      .eq('id', runId)

    return { candidateCount: candidates.length, approvedCount: editorOutput.length }
  } catch (err) {
    await admin
      .from('trend_pipeline_runs')
      .update({ status: 'failed' })
      .eq('id', runId)
      .eq('status', 'running')
    throw err
  }
}
