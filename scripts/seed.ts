import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../app/lib/types'

const IDEAS_TO_GENERATE = 5
const MODEL = 'claude-sonnet-4-6'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anthropicKey = process.env.ANTHROPIC_API_KEY

if (!url || !serviceRoleKey || !anthropicKey) {
  console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY')
  process.exit(1)
}

const anthropic = new Anthropic({ apiKey: anthropicKey })
const supabase = createClient<Database>(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type IdeaInsert = Database['public']['Tables']['ideas']['Insert']
type TrendInsert = Database['public']['Tables']['trends']['Insert']
type InsightInsert = Database['public']['Tables']['market_insights']['Insert']
type SignalInsert = Database['public']['Tables']['community_signals']['Insert']

function extractJson(text: string): unknown {
  const match = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
  return JSON.parse(match ? match[1] : text.trim())
}

async function callClaude(prompt: string): Promise<unknown> {
  console.log(`  → calling Claude (${MODEL})...`)
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = response.content.find((b) => b.type === 'text')?.text ?? ''
  return extractJson(text)
}

async function generateIdeas(): Promise<IdeaInsert[]> {
  console.log('\n[1/4] Generating ideas...')
  const data = await callClaude(`Generate ${IDEAS_TO_GENERATE} startup ideas for product managers and founders building software businesses.

Return ONLY a JSON array with no other text. Each object must have exactly these fields:
{
  "slug": "kebab-case-unique-id",
  "title": "Idea Title",
  "tagline": "One-sentence value proposition",
  "description": "2-3 sentence description of the problem and solution",
  "category": "one of: productivity, analytics, developer-tools, hr-tech, sales, marketing, finance, healthcare, edtech, proptech",
  "business_model": "one of: saas, service, marketplace, content, hardware",
  "market_type": "B2B or B2C or B2B2C",
  "revenue_potential": "one of: low, medium, high, very-high",
  "execution_difficulty": "one of: low, medium, high, very-high",
  "score_opportunity": integer between 0 and 100,
  "score_problem": integer between 0 and 100,
  "score_feasibility": integer between 0 and 100,
  "score_timing": integer between 0 and 100,
  "score_pm_fit": integer between 0 and 100
}

Make each idea distinct and realistic. All score fields must be integers.`)
  return (data as IdeaInsert[]).map((idea) => ({
    ...idea,
    published: true,
    is_idea_of_day: false,
  }))
}

async function generateTrends(): Promise<TrendInsert[]> {
  console.log('\n[2/4] Generating trends...')
  const data = await callClaude(`Generate 4 current market trends relevant to PM and founder software tools.

Return ONLY a JSON array with no other text. Each object must have exactly these fields:
{
  "keyword": "Trend keyword or phrase",
  "volume": integer search volume estimate (10000-500000),
  "growth_pct": numeric growth percentage (e.g. 45.5),
  "description": "1-2 sentence description of the trend",
  "category": "one of: ai, automation, remote-work, developer-tools, data, security, no-code, analytics"
}`)
  return data as TrendInsert[]
}

async function generateMarketInsights(): Promise<InsightInsert[]> {
  console.log('\n[3/4] Generating market insights...')
  const data = await callClaude(`Generate 3 market insight data points with realistic metrics for the PM and founder software market.

Return ONLY a JSON array with no other text. Each object must have exactly these fields:
{
  "title": "Insight title",
  "metric_label": "Metric name (e.g. 'Market Size', 'YoY Growth')",
  "metric_value": "Value as string (e.g. '$12.4B', '34%')",
  "metric_period": "Time period (e.g. '2025', 'Q1 2025')",
  "description": "1-2 sentence context for this metric",
  "insight_type": "one of: market_size, growth_signal, community_demand",
  "source_label": "Source name (e.g. 'Gartner', 'IDC', 'Forrester')"
}`)
  return data as InsightInsert[]
}

async function generateCommunitySignals(
  ideas: Array<IdeaInsert & { id: string }>,
): Promise<SignalInsert[]> {
  console.log('\n[4/4] Generating community signals...')
  const slugList = ideas.map((i) => `- ${i.slug}`).join('\n')
  const data = await callClaude(`For each startup idea slug below, generate community signal data for reddit, facebook, and youtube platforms.

Ideas:
${slugList}

Return ONLY a JSON array with no other text. For each idea × platform combination, include one object:
{
  "idea_slug": "the-idea-slug",
  "platform": "one of: reddit, facebook, youtube",
  "count": integer number of posts/videos/discussions (10-5000),
  "themes": ["theme1", "theme2", "theme3"]
}

Total objects: ${ideas.length * 3} (one per idea per platform).`)

  const slugToId = Object.fromEntries(ideas.map((i) => [i.slug, i.id]))
  return (data as Array<SignalInsert & { idea_slug: string }>)
    .filter((s) => slugToId[s.idea_slug])
    .map(({ idea_slug, ...rest }) => ({
      ...rest,
      idea_id: slugToId[idea_slug],
    }))
}

async function seed() {
  console.log('=== LaunchPlan Seed Script ===')
  console.log('Truncating existing data...')

  const tables = [
    'community_signals',
    'saved_ideas',
    'idea_stats',
    'agent_runs',
    'ideas',
    'trends',
    'market_insights',
  ] as const

  for (const table of tables) {
    const dateCol = table === 'idea_stats' ? 'updated_at' : 'created_at'
    const { error } = await supabase.from(table).delete().gte(dateCol, '2000-01-01')
    if (error) throw new Error(`Failed to delete from ${table}: ${error.message}`)
  }

  const [ideas, trends, insights] = await Promise.all([
    generateIdeas(),
    generateTrends(),
    generateMarketInsights(),
  ])

  const today = new Date().toISOString().split('T')[0]
  ideas[0] = { ...ideas[0], is_idea_of_day: true, idea_of_day_date: today }

  console.log('\nInserting ideas...')
  const { data: insertedIdeas, error: ideasError } = await supabase
    .from('ideas')
    .insert(ideas)
    .select('id, slug')
  if (ideasError) throw new Error(`Failed to insert ideas: ${ideasError.message}`)

  const ideasWithIds = ideas.map((idea, i) => ({
    ...idea,
    id: insertedIdeas![i].id,
  })) as Array<IdeaInsert & { id: string }>

  const signals = await generateCommunitySignals(ideasWithIds)

  console.log('\nInserting trends, insights, and signals...')
  const [trendsResult, insightsResult, signalsResult] = await Promise.all([
    supabase.from('trends').insert(trends),
    supabase.from('market_insights').insert(insights),
    supabase.from('community_signals').insert(signals),
  ])

  if (trendsResult.error) throw new Error(`Failed to insert trends: ${trendsResult.error.message}`)
  if (insightsResult.error) throw new Error(`Failed to insert insights: ${insightsResult.error.message}`)
  if (signalsResult.error) throw new Error(`Failed to insert signals: ${signalsResult.error.message}`)

  const { error: statsError } = await supabase.from('idea_stats').insert({
    total_ideas: ideas.length,
    total_trends: trends.length,
    total_insights: insights.length,
  })
  if (statsError) throw new Error(`Failed to insert idea_stats: ${statsError.message}`)

  console.log(`\n✓ Seeded ${ideas.length} ideas, ${trends.length} trends, ${insights.length} insights, ${signals.length} community signals`)
  console.log(`✓ Idea of the day: ${ideas[0].slug} (${today})`)
}

seed().catch((err) => {
  console.error('\n✗ Seed failed:', err.message)
  process.exit(1)
})
