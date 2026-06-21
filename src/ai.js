// Generate Taboo card content (examples + taboo words) for a guess word using
// an OpenAI-compatible chat-completions endpoint with structured output.

// Taboo words come AFTER examples in the schema on purpose: the model writes
// the descriptions first and then distils the taboo words from them.
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    examples: {
      type: 'array',
      description:
        'Example sentences that naturally describe the guess word without saying it.',
      items: { type: 'string' },
    },
    tabooWords: {
      type: 'array',
      description:
        'The most important and common words drawn from the example sentences.',
      items: { type: 'string' },
    },
  },
  required: ['examples', 'tabooWords'],
  additionalProperties: false,
}

function buildPrompt(guessWord) {
  return (
    'We are creating cards for the board game "Taboo". Each card has a guess ' +
    'word and several taboo words. The describing player must get their team ' +
    'to say the guess word WITHOUT using any of the taboo words — so the taboo ' +
    'words should be exactly the words that are hardest to avoid when ' +
    'describing it.\n\n' +
    `Generate the content for the guess word: "${guessWord}".\n\n` +
    'First, write 8 example sentences someone might naturally use to describe ' +
    'this word (without using the word itself). Then, based on those ' +
    'sentences, identify the 5 most important and commonly used words most ' +
    'likely to appear in such descriptions, and select them as the taboo ' +
    'words.\n\n' +
    'Write BOTH the example sentences and the taboo words in the SAME LANGUAGE ' +
    'as the guess word.'
  )
}

export async function generateCardContent(guessWord, settings) {
  const baseUrl = (settings.baseUrl || '').replace(/\/+$/, '')
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [{ role: 'user', content: buildPrompt(guessWord) }],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'taboo_card',
          strict: true,
          schema: RESPONSE_SCHEMA,
        },
      },
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}). ${detail}`.trim())
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('The model returned an empty response.')

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('The model did not return valid JSON.')
  }

  return {
    examples: (parsed.examples || []).map(String),
    tabooWords: (parsed.tabooWords || []).map(String),
    usage: usageWithCost(data.usage, settings),
  }
}

// Normalize the OpenAI usage object and add a USD cost from the configured
// per-1M-token prices. Returns null when the endpoint reports no usage.
function usageWithCost(usage, settings) {
  if (!usage) return null
  const inputTokens = usage.prompt_tokens ?? 0
  const outputTokens = usage.completion_tokens ?? 0
  const totalTokens = usage.total_tokens ?? inputTokens + outputTokens
  const cost =
    (inputTokens * (Number(settings.inputPrice) || 0) +
      outputTokens * (Number(settings.outputPrice) || 0)) /
    1_000_000
  return { inputTokens, outputTokens, totalTokens, cost }
}
