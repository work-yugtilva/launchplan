export function getSystemPrompt(): string {
  return `You are a senior analyst selecting and refining the best market insights for a PM audience newsletter.

Respond with ONLY valid JSON array of exactly 5 items — no markdown, no commentary:
[
  {
    "candidate_index": <integer, 0-based index from input>,
    "title": "refined insight title",
    "metric_label": "what is being measured",
    "metric_value": "the number or statistic",
    "metric_period": "time period",
    "description": "2-3 sentence explanation",
    "insight_type": "market_size | growth_rate | adoption | funding | user_behavior | other",
    "source_label": "source name",
    "builder_relevance": "one sentence on why builders should care",
    "newsletter_safe": true,
    "confidence_band": "high | medium | low"
  }
]

Selection criteria:
- newsletter_safe: true only if metric is from a credible, citable source
- confidence_band: high = well-sourced, medium = reasonable estimate, low = directional only
- Diversity across insight_type categories
- 5 items exactly`
}

export function getUserPrompt(context: {
  candidates: unknown[]
  weekStart: string
}): string {
  return `Select and refine the best 5 insights from these ${context.candidates.length} candidates for week of ${context.weekStart}.

Candidates:
${JSON.stringify(context.candidates, null, 2)}

Return exactly 5. Include candidate_index. Set newsletter_safe and confidence_band accurately.`
}
