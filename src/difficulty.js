// Difficulty levels, ordered from easiest to hardest.
export const DIFFICULTIES = ['easy', 'normal', 'hard']

export const DIFFICULTY_LABELS = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
}

// Cards store taboo words as a flat list of { word, difficulty } entries in
// arbitrary order. When printing at a chosen level, keep every word whose own
// difficulty is at-or-below that level — easy includes easy only, normal also
// includes easy, hard includes everything. The stored order is preserved as-is.
export function tabooWordsForDifficulty(tabooWords, difficulty) {
  if (!Array.isArray(tabooWords)) return []
  const maxRank = DIFFICULTIES.indexOf(difficulty)
  if (maxRank < 0) return tabooWords.map((t) => t.word)
  return tabooWords
    .filter((t) => DIFFICULTIES.indexOf(t.difficulty) <= maxRank)
    .map((t) => t.word)
}
