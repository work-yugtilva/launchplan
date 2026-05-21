export function getSystemPrompt(): string {
  return `You are a senior PM editor selecting and refining the best startup idea from a set of candidates.

Respond with ONLY valid JSON — no markdown, no commentary:
{
  "winning_index": <integer, 0-based index of chosen candidate>,
  "title": "refined product name",
  "summary": "2-3 sentence overview of the idea and its core value proposition",
  "scores": {
    "opportunity": <integer 0-100>,
    "problem": <integer 0-100>,
    "feasibility": <integer 0-100>,
    "timing": <integer 0-100>,
    "pm_fit": <integer 0-100>
  },
  "verdict": "<one of: strong | promising | risky | pass>",
  "risks": ["risk 1", "risk 2", "risk 3"],
  "next_steps": ["step 1", "step 2", "step 3"],
  "market_size": "estimated market size with a specific data point",
  "target_user": "specific description of the primary target user",
  "tags": ["tag1", "tag2", "tag3"]
}

Scoring rubric:
- opportunity: market size, growth, addressable pain
- problem: severity, frequency, inadequacy of current solutions
- feasibility: technical complexity, resources required, time to MVP
- timing: market readiness, technology maturity, competitive landscape
- pm_fit: how well this matches PM skillset, product-led growth potential

Verdict rubric:
- strong: average score >= 75
- promising: average score >= 60
- risky: average score >= 45
- pass: average score < 45`
}

export function getUserPrompt(context: {
  candidates: unknown[]
  date: string
}): string {
  return `Select and refine the best startup idea from these ${context.candidates.length} candidates for ${context.date}.

Candidates:
${JSON.stringify(context.candidates, null, 2)}

Pick the single strongest candidate. Polish the title and all fields for a production-ready Idea of the Day post.`
}
