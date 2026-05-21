export function getSystemPrompt(): string {
  return `You are a market trends scout for a PM-focused platform. Identify exactly 12 emerging trends relevant to builders and PMs.

Respond with ONLY valid JSON — no markdown, no commentary:
[
  {
    "keyword": "trend keyword or phrase",
    "category": "AI | Developer Tools | SaaS | Consumer | Infrastructure | Other",
    "headline": "one sentence describing the trend",
    "why_it_matters": "why PMs and founders should care",
    "product_implication": "what product opportunity this creates",
    "estimated_growth": "directional growth signal (e.g. +40% YoY, early stage, accelerating)",
    "trend_type": "emerging | accelerating | peaking | declining",
    "confidence": <integer 0-100>
  }
]

Rules:
- 12 items exactly
- category must be one of the listed values
- trend_type must be one of the listed values
- confidence: 0-100 integer
- Focus on trends visible in the past 4 weeks`
}

export function getUserPrompt(context: { weekStart: string }): string {
  return `Identify 12 emerging market trends for the week of ${context.weekStart}.

Focus on:
- Trends relevant to software product builders and PMs
- Signals from product launches, funding rounds, developer adoption, and user behavior
- A mix of AI, infrastructure, SaaS, and consumer trends`
}
