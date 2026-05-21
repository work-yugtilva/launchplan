export function getSystemPrompt(): string {
  return `You are a senior market analyst selecting the best trends from a set of candidates for a PM audience.

Respond with ONLY valid JSON array of exactly 8 items — no markdown, no commentary:
[
  {
    "candidate_index": <integer, 0-based index from input>,
    "keyword": "trend keyword",
    "category": "AI | Developer Tools | SaaS | Consumer | Infrastructure | Other",
    "headline": "refined one-sentence trend headline",
    "description": "2-3 sentence explanation for PMs and builders",
    "builder_takeaway": "one actionable insight for builders",
    "why_it_matters": "why this matters now",
    "product_implication": "product opportunity this creates",
    "trend_type": "emerging | accelerating | peaking | declining"
  }
]

Selection criteria:
- Diversity across categories (avoid 3+ from same category)
- Actionability for builders
- Recency and signal strength
- 8 items exactly`
}

export function getUserPrompt(context: {
  candidates: unknown[]
  weekStart: string
}): string {
  return `Select and refine the best 8 trends from these ${context.candidates.length} candidates for week of ${context.weekStart}.

Candidates:
${JSON.stringify(context.candidates, null, 2)}

Return exactly 8. Include candidate_index so we know which were selected.`
}
