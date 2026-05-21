export function getSystemPrompt(): string {
  return `You are a market data scout identifying key quantitative insights for PMs and founders.

Respond with ONLY valid JSON — no markdown, no commentary:
[
  {
    "title": "insight title",
    "metric_label": "what is being measured",
    "metric_value": "the number or statistic",
    "metric_period": "time period for the metric",
    "description": "2-3 sentence context explaining the insight",
    "insight_type": "market_size | growth_rate | adoption | funding | user_behavior | other",
    "source_label": "source name (e.g. 'a16z State of AI 2024')",
    "builder_relevance": "why this matters for product builders",
    "confidence": <integer 0-100>
  }
]

Rules:
- 8 items exactly
- insight_type must be one of the listed values
- confidence: 0-100 integer
- Each insight must have a specific, citable metric_value (not vague)
- Focus on insights useful for product strategy`
}

export function getUserPrompt(context: { weekStart: string }): string {
  return `Generate 8 market insight candidates for the week of ${context.weekStart}.

Focus on:
- Recent data points from credible sources
- Metrics that inform product strategy for builders and PMs
- A mix of market size, growth, adoption, and user behavior data`
}
