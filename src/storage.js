const STORAGE_KEY = 'taboo.cards.v1'
const AI_KEY = 'taboo.ai.v1'

// Defaults to OpenAI's endpoint, but the base URL is editable so a local
// OpenAI-compatible server (LM Studio, Ollama, vLLM, …) can be used instead.
export const DEFAULT_AI_SETTINGS = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
  // USD price per 1M tokens (defaults are gpt-4o-mini's rates). Set to 0 for a
  // free local model.
  inputPrice: 0.15,
  outputPrice: 0.6,
}

export function loadAiSettings() {
  try {
    const raw = localStorage.getItem(AI_KEY)
    if (!raw) return { ...DEFAULT_AI_SETTINGS }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_AI_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_AI_SETTINGS }
  }
}

export function saveAiSettings(settings) {
  try {
    localStorage.setItem(AI_KEY, JSON.stringify(settings))
  } catch {
    // Ignore quota / serialization errors — persistence is best-effort.
  }
}

export function loadCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isValidCard) : []
  } catch {
    return []
  }
}

export function saveCards(cards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
  } catch {
    // Ignore quota / serialization errors — persistence is best-effort.
  }
}

export function isValidCard(card) {
  return (
    card &&
    typeof card === 'object' &&
    typeof card.guessWord === 'string' &&
    Array.isArray(card.tabooWords) &&
    // examples are optional, but must be an array of strings when present.
    (card.examples === undefined || Array.isArray(card.examples)) &&
    typeof card.color === 'string'
  )
}

// Generate a unique-enough id without relying on Date.now/Math.random shape.
export function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'card-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}
