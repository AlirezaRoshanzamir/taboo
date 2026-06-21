const STORAGE_KEY = 'taboo.cards.v1'

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
