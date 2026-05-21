import Anthropic from '@anthropic-ai/sdk'

const PIPELINE_MODEL = 'claude-sonnet-4-5'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface CallAnthropicOptions {
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
  temperature?: number
}

export async function callAnthropic(options: CallAnthropicOptions): Promise<string> {
  const { systemPrompt, userPrompt, maxTokens = 2000, temperature } = options
  const message = await client.messages.create({
    model: PIPELINE_MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    ...(temperature !== undefined ? { temperature } : {}),
  })
  const block = message.content[0]
  return block.type === 'text' ? block.text : ''
}

export function extractJson<T>(text: string): T {
  const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (!match) throw new Error(`No JSON found in model response: ${text.slice(0, 200)}`)
  return JSON.parse(match[0]) as T
}
