// Card colors. The `value` is the display/swatch color; `key` is stored on cards
// and used for grouping so players can finish one color before the next.
export const CARD_COLORS = [
  { key: 'orange', label: 'Orange', value: '#e38136' },
  { key: 'green', label: 'Green', value: '#7fc42b' },
  { key: 'yellow', label: 'Yellow', value: '#ebb526' },
  { key: 'blue', label: 'Blue', value: '#3454d9' },
  { key: 'red', label: 'Red', value: '#ef4444' },
  { key: 'purple', label: 'Purple', value: '#a855f7' },
  { key: 'pink', label: 'Pink', value: '#ec4899' },
  { key: 'teal', label: 'Teal', value: '#14b8a6' },
]

export const DEFAULT_COLOR = CARD_COLORS[0].key

export function colorValue(key) {
  return CARD_COLORS.find((c) => c.key === key)?.value ?? '#94a3b8'
}

export function colorLabel(key) {
  return CARD_COLORS.find((c) => c.key === key)?.label ?? key
}
