import 'server-only'

import { createClient } from '@/app/lib/supabase/server'
import type {
  Idea,
  IdeaOfDayResponse,
  IdeasResponse,
  MarketInsight,
  StatsResponse,
  Trend,
  IdeaStats as IdeaStatsRow,
} from '@/app/lib/types'

const STATS_FALLBACK: StatsResponse = {
  total_ideas: 0,
  total_trends: 0,
  total_insights: 0,
}

export async function queryIdeaOfDay(): Promise<IdeaOfDayResponse | null> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: todayIdea, error: todayError } = await supabase
    .from('ideas')
    .select('*')
    .eq('is_idea_of_day', true)
    .eq('idea_of_day_date', today)
    .eq('published', true)
    .maybeSingle()

  if (todayError) throw todayError

  let idea = todayIdea

  if (!idea) {
    const { data: fallbackIdea, error: fallbackError } = await supabase
      .from('ideas')
      .select('*')
      .eq('is_idea_of_day', true)
      .eq('published', true)
      .order('idea_of_day_date', { ascending: false })
      .maybeSingle()

    if (fallbackError) throw fallbackError
    idea = fallbackIdea
  }

  if (!idea) return null

  const base = idea as Idea

  const [signalsResult, prevResult, nextResult] = await Promise.all([
    supabase.from('community_signals').select('*').eq('idea_id', base.id),
    supabase
      .from('ideas')
      .select('slug, idea_of_day_date')
      .lt('idea_of_day_date', base.idea_of_day_date)
      .eq('is_idea_of_day', true)
      .eq('published', true)
      .order('idea_of_day_date', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('ideas')
      .select('slug, idea_of_day_date')
      .gt('idea_of_day_date', base.idea_of_day_date)
      .eq('is_idea_of_day', true)
      .eq('published', true)
      .order('idea_of_day_date', { ascending: true })
      .limit(1)
      .single(),
  ])

  type NavSlugRow = { slug: string; idea_of_day_date: string | null }

  const prevData = (prevResult as { data: NavSlugRow | null }).data
  const nextData = (nextResult as { data: NavSlugRow | null }).data

  const response: IdeaOfDayResponse = {
    idea: { ...base, community_signals: signalsResult.data ?? [] },
    prev: prevData
      ? { slug: prevData.slug, date: prevData.idea_of_day_date ?? '' }
      : null,
    next: nextData
      ? { slug: nextData.slug, date: nextData.idea_of_day_date ?? '' }
      : null,
  }

  return response
}

export async function queryPublishedIdeas(options: {
  limit?: number
  offset?: number
  category?: string | null
  business_model?: string | null
  search?: string | null
} = {}): Promise<IdeasResponse> {
  const rawLimit = Number(options.limit ?? 12)
  const limit = Math.min(50, Math.max(1, isNaN(rawLimit) ? 12 : rawLimit))
  const rawOffset = Number(options.offset ?? 0)
  const offset = Math.max(0, isNaN(rawOffset) ? 0 : rawOffset)
  const category = options.category ?? null
  const businessModel = options.business_model ?? null
  const search = options.search ? options.search.slice(0, 200) : null

  const supabase = await createClient()

  let query = supabase.from('ideas').select('*', { count: 'exact' }).eq('published', true)

  if (category) query = query.eq('category', category)
  if (businessModel) query = query.eq('business_model', businessModel)
  if (search) query = query.or(`title.ilike.%${search}%,tagline.ilike.%${search}%`)

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) throw error

  return {
    ideas: data ?? [],
    total: count ?? 0,
    hasMore: offset + limit < (count ?? 0),
  }
}

const DEFAULT_TREND_SORT = 'growth_pct' as const
const ALLOWED_TREND_SORTS = ['growth_pct', 'volume'] as const

export async function queryTrends(options: {
  limit?: number
  sort_by?: string | null
  category?: string | null
} = {}): Promise<{ trends: Trend[]; total: number }> {
  const DEFAULT_LIMIT = 4
  const MAX_LIMIT = 20

  const rawLimit = parseInt(String(options.limit ?? DEFAULT_LIMIT), 10)
  const limit = isNaN(rawLimit) ? DEFAULT_LIMIT : Math.min(Math.max(1, rawLimit), MAX_LIMIT)

  const rawSort = options.sort_by ?? DEFAULT_TREND_SORT
  const sortBy = (ALLOWED_TREND_SORTS as readonly string[]).includes(rawSort)
    ? (rawSort as (typeof ALLOWED_TREND_SORTS)[number])
    : DEFAULT_TREND_SORT

  const category = options.category ?? null

  const supabase = await createClient()

  let query = supabase
    .from('trends')
    .select('*')
    .order(sortBy, { ascending: false, nullsFirst: false })
    .limit(limit)

  if (category) query = query.eq('category', category)

  const { data, error } = await query

  if (error) throw error

  const trends = data ?? []
  return { trends, total: trends.length }
}

const ALLOWED_INSIGHT_TYPES = ['market_size', 'growth_signal', 'community_demand'] as const

export async function queryMarketInsights(options: {
  limit?: number
  insight_type?: string | null
} = {}): Promise<{ insights: MarketInsight[]; total: number }> {
  const DEFAULT_LIMIT = 3
  const MAX_LIMIT = 12

  const rawLimit = parseInt(String(options.limit ?? DEFAULT_LIMIT), 10)
  const limit = isNaN(rawLimit) ? DEFAULT_LIMIT : Math.min(Math.max(1, rawLimit), MAX_LIMIT)

  const rawType = options.insight_type ?? null
  const insightType =
    rawType && (ALLOWED_INSIGHT_TYPES as readonly string[]).includes(rawType)
      ? (rawType as (typeof ALLOWED_INSIGHT_TYPES)[number])
      : null

  const supabase = await createClient()

  let query = supabase
    .from('market_insights')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (insightType) query = query.eq('insight_type', insightType)

  const { data, error } = await query

  if (error) throw error

  const insights = data ?? []
  return { insights, total: insights.length }
}

export async function querySiteStats(): Promise<StatsResponse> {
  try {
    const supabase = await createClient()

    const { data: rows } = await supabase
      .from('idea_stats')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)

    const row = rows?.[0] as IdeaStatsRow | undefined

    if (row) {
      return {
        total_ideas: row.total_ideas,
        total_trends: row.total_trends,
        total_insights: row.total_insights,
      }
    }

    const [ideasRes, trendsRes, insightsRes] = await Promise.all([
      supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('trends').select('*', { count: 'exact', head: true }),
      supabase.from('market_insights').select('*', { count: 'exact', head: true }),
    ])

    return {
      total_ideas: ideasRes.count ?? 0,
      total_trends: trendsRes.count ?? 0,
      total_insights: insightsRes.count ?? 0,
    }
  } catch {
    return STATS_FALLBACK
  }
}
