const STORAGE_KEY = 'taboo.cards.v3'
const AI_KEY = 'taboo.ai.v1'

export const DEFAULT_AI_SETTINGS = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
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
    // best-effort
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
    // best-effort
  }
}

const VALID_DIFFICULTIES = new Set(['easy', 'normal', 'hard'])

export function isValidCard(card) {
  return (
    card &&
    typeof card === 'object' &&
    typeof card.guessWord === 'string' &&
    Array.isArray(card.tabooWords) &&
    card.tabooWords.every(
      (t) =>
        t &&
        typeof t.word === 'string' &&
        VALID_DIFFICULTIES.has(t.difficulty),
    ) &&
    Array.isArray(card.examples) &&
    typeof card.color === 'string'
  )
}

export function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'card-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}
