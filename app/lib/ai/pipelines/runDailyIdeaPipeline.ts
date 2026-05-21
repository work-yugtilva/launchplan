import { z } from 'zod'
import { supabaseAdmin } from '@/app/lib/supabase/admin'
import { callAnthropic, extractJson } from '@/app/lib/ai/anthropic'
import { getSystemPrompt as scoutSystem, getUserPrompt as scoutUser } from '@/app/lib/ai/prompts/daily-idea-scout'
import { getSystemPrompt as editorSystem, getUserPrompt as editorUser } from '@/app/lib/ai/prompts/daily-idea-editor'
import { slugifyTitle } from '@/app/lib/ai/utils/slug'

const ScoutCandidateSchema = z.object({
  title: z.string(),
  one_liner: z.string(),
  target_user: z.string(),
  core_problem: z.string(),
  why_now: z.string(),
  business_model: z.string(),
  market_type: z.enum(['B2B', 'B2C', 'B2B2C', 'marketplace']),
  build_scope: z.string(),
  revenue_potential: z.enum(['low', 'medium', 'high']),
  scout_score: z.number().int().min(0).max(100),
})

const ScoutOutputSchema = z.array(ScoutCandidateSchema).min(1)

const EditorOutputSchema = z.object({
  winning_index: z.number().int().min(0),
  title: z.string(),
  summary: z.string(),
  scores: z.object({
    opportunity: z.number().int().min(0).max(100),
    problem: z.number().int().min(0).max(100),
    feasibility: z.number().int().min(0).max(100),
    timing: z.number().int().min(0).max(100),
    pm_fit: z.number().int().min(0).max(100),
  }),
  verdict: z.enum(['strong', 'promising', 'risky', 'pass']),
  risks: z.array(z.string()),
  next_steps: z.array(z.string()),
  market_size: z.string(),
  target_user: z.string(),
  tags: z.array(z.string()),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const admin = supabaseAdmin as any

export interface DailyIdeaPipelineResult {
  candidateCount: number
  draftedIdeaId: string
}

export async function runDailyIdeaPipeline(
  runId: string,
  runDate: string,
): Promise<DailyIdeaPipelineResult> {
  // Mark running
  await admin
    .from('idea_pipeline_runs')
    .update({ status: 'running' })
    .eq('id', runId)

  try {
    // Scout stage
    const scoutText = await callAnthropic({
      systemPrompt: scoutSystem(),
      userPrompt: scoutUser({ date: runDate }),
      maxTokens: 3000,
    })

    let candidates: z.infer<typeof ScoutCandidateSchema>[]
    try {
      candidates = ScoutOutputSchema.parse(extractJson(scoutText))
    } catch (err) {
      console.error('[runDailyIdeaPipeline] scout parse error', err)
      await admin
        .from('idea_pipeline_runs')
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
      .from('idea_candidates')
      .insert(candidateRows)
      .select('id')
    if (insertError) throw insertError

    await admin
      .from('idea_pipeline_runs')
      .update({ candidate_count: candidates.length })
      .eq('id', runId)

    // Editor stage
    const editorText = await callAnthropic({
      systemPrompt: editorSystem(),
      userPrompt: editorUser({ candidates, date: runDate }),
      maxTokens: 2000,
    })

    let editorOutput: z.infer<typeof EditorOutputSchema>
    try {
      editorOutput = EditorOutputSchema.parse(extractJson(editorText))
    } catch (err) {
      console.error('[runDailyIdeaPipeline] editor parse error', err)
      await admin
        .from('idea_pipeline_runs')
        .update({ status: 'failed', error_message: 'Editor output parse failed' })
        .eq('id', runId)
      throw err
    }

    const winnerIndex = editorOutput.winning_index
    if (winnerIndex >= insertedCandidates.length) {
      throw new Error(`Editor winning_index ${winnerIndex} out of bounds (${insertedCandidates.length} candidates)`)
    }
    const winnerId: string = insertedCandidates[winnerIndex].id

    // Update winner candidate with editor_output
    await admin
      .from('idea_candidates')
      .update({ editor_output: editorOutput, status: 'approved' })
      .eq('id', winnerId)

    // Reject all other candidates
    const loserIds = insertedCandidates
      .map((c: { id: string }) => c.id)
      .filter((id: string) => id !== winnerId)
    if (loserIds.length > 0) {
      await admin
        .from('idea_candidates')
        .update({ status: 'rejected' })
        .in('id', loserIds)
    }

    // Draft idea (not published, not idea_of_day)
    const { data: draftedIdea, error: ideaError } = await admin
      .from('ideas')
      .insert({
        slug: slugifyTitle(editorOutput.title, runDate) + '-' + runId.slice(0, 8),
        title: editorOutput.title,
        summary: editorOutput.summary,
        verdict: editorOutput.verdict,
        score_opportunity: editorOutput.scores.opportunity,
        score_problem: editorOutput.scores.problem,
        score_feasibility: editorOutput.scores.feasibility,
        score_timing: editorOutput.scores.timing,
        score_pm_fit: editorOutput.scores.pm_fit,
        risks: editorOutput.risks,
        next_steps: editorOutput.next_steps,
        market_size: editorOutput.market_size,
        target_user: editorOutput.target_user,
        tags: editorOutput.tags,
        published: false,
        is_idea_of_day: false,
      })
      .select('id')
      .single()
    if (ideaError) throw ideaError

    const draftedIdeaId: string = draftedIdea.id

    // Link winner candidate + run to drafted idea
    await admin
      .from('idea_candidates')
      .update({ drafted_idea_id: draftedIdeaId })
      .eq('id', winnerId)

    await admin
      .from('idea_pipeline_runs')
      .update({ status: 'completed', drafted_idea_id: draftedIdeaId })
      .eq('id', runId)

    return { candidateCount: candidates.length, draftedIdeaId }
  } catch (err) {
    // Only update to failed if not already updated
    await admin
      .from('idea_pipeline_runs')
      .update({ status: 'failed' })
      .eq('id', runId)
      .eq('status', 'running')
    throw err
  }
}
