// Generate Taboo card content (12 examples + difficulty-bucketed taboo words)
// for a guess word using an OpenAI-compatible chat-completions endpoint with
// structured output.

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    examples: {
      type: 'array',
      description:
        'Exactly 12 example sentences that naturally describe the guess word without saying it.',
      items: { type: 'string' },
    },
    tabooWords: {
      type: 'object',
      description:
        'Taboo words drawn from the example sentences, grouped by how hard each one is to avoid.',
      properties: {
        easy: {
          type: 'array',
          description:
            'Exactly 5 of the MOST OBVIOUS, hardest-to-avoid words a describer would reach for first.',
          items: { type: 'string' },
        },
        normal: {
          type: 'array',
          description:
            'Exactly 4 moderately common words that show up often in good descriptions but are not the very first reach.',
          items: { type: 'string' },
        },
        hard: {
          type: 'array',
          description:
            'Exactly 3 less-obvious but still common words. Banning these makes the card noticeably harder.',
          items: { type: 'string' },
        },
      },
      required: ['easy', 'normal', 'hard'],
      additionalProperties: false,
    },
  },
  required: ['examples', 'tabooWords'],
  additionalProperties: false,
}

function buildPrompt(guessWord) {
  return (
    'We are creating cards for the board game "Taboo". Each card has a guess ' +
    'word and several taboo words. The describing player must get their team ' +
    'to say the guess word WITHOUT using any of the taboo words.\n\n' +
    `Generate the content for the guess word: "${guessWord}".\n\n` +
    'Step 1 — write exactly 12 example sentences someone might naturally use ' +
    'to describe this word (without using the word itself). Cover a variety of ' +
    'angles (function, parts, contexts, common pairings, idioms, sensory cues).\n\n' +
    'Step 2 — from those sentences, pick taboo words and split them into three ' +
    'difficulty buckets:\n' +
    '  • easy   — exactly 5 words. The MOST OBVIOUS words; the very first ' +
    'things a describer would reach for. Banning these alone already makes a ' +
    'playable easy card.\n' +
    '  • normal — exactly 4 words. Common in good descriptions but not the ' +
    'absolute first reach. Adding these on top of the easy ones makes a normal card.\n' +
    '  • hard   — exactly 3 words. Less obvious but still natural; banning ' +
    'these on top of easy+normal makes the card noticeably challenging.\n\n' +
    'STRICT RULES:\n' +
    `  • NEVER include the guess word itself ("${guessWord}") in any bucket — not as-is, not as a stem, not as a plural or conjugation.\n` +
    '  • No word may appear in more than one bucket.\n' +
    '  • Each taboo should be a single word or a short common phrase.\n\n' +
    'Write BOTH the example sentences and all taboo words in the SAME LANGUAGE ' +
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

  // Flatten the AI's categorized output into the canonical per-word format
  // the rest of the app uses. Order: easy → normal → hard, preserving each
  // bucket's internal order.
  const t = parsed.tabooWords || {}
  const needle = guessWord.trim().toLowerCase()
  const flat = []
  for (const level of ['easy', 'normal', 'hard']) {
    for (const raw of t[level] || []) {
      const word = String(raw).trim()
      if (!word || word.toLowerCase() === needle) continue
      flat.push({ word, difficulty: level })
    }
  }
  return {
    examples: (parsed.examples || []).map(String),
    tabooWords: flat,
    usage: usageWithCost(data.usage, settings),
  }
}

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
