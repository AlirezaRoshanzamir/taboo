import { CARD_COLORS, colorLabel, colorValue } from '../colors.js'

export default function CardList({ cards, editingId, onEdit, onDelete }) {
  if (cards.length === 0) {
    return (
      <p className="empty">
        No cards yet. Add your first card above, or upload an existing set.
      </p>
    )
  }

  // Group by color, in the canonical color order, so play can go orange-first.
  const groups = CARD_COLORS.map((c) => ({
    color: c.key,
    cards: cards.filter((card) => card.color === c.key),
  })).filter((g) => g.cards.length > 0)

  // Include any colors not in the preset (e.g. from an uploaded file).
  const knownKeys = new Set(CARD_COLORS.map((c) => c.key))
  const extraKeys = [...new Set(cards.map((c) => c.color))].filter(
    (k) => !knownKeys.has(k),
  )
  for (const key of extraKeys) {
    groups.push({ color: key, cards: cards.filter((c) => c.color === key) })
  }

  return (
    <div className="card-groups">
      {groups.map((group) => (
        <section className="card-group" key={group.color}>
          <h3 className="card-group__title">
            <span
              className="card-group__dot"
              style={{ background: colorValue(group.color) }}
            />
            {colorLabel(group.color)}
            <span className="card-group__count">{group.cards.length}</span>
          </h3>
          <div className="card-grid">
            {group.cards.map((card) => (
              <article
                className={
                  'taboo-card' +
                  (card.id === editingId ? ' taboo-card--editing' : '')
                }
                key={card.id}
                style={{ '--accent': colorValue(card.color) }}
              >
                <div className="taboo-card__bar" />
                <div className="taboo-card__actions">
                  <button
                    type="button"
                    className="taboo-card__action"
                    onClick={() => onEdit(card)}
                    aria-label="Edit card"
                    title="Edit card"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="taboo-card__action taboo-card__action--delete"
                    onClick={() => onDelete(card.id)}
                    aria-label="Delete card"
                    title="Delete card"
                  >
                    ×
                  </button>
                </div>
                <h4 className="taboo-card__guess" dir="auto">
                  {card.guessWord}
                </h4>
                <ul className="taboo-card__words">
                  {card.tabooWords.length === 0 ? (
                    <li className="taboo-card__word taboo-card__word--empty">
                      (no taboo words)
                    </li>
                  ) : (
                    card.tabooWords.map((word, i) => (
                      <li className="taboo-card__word" dir="auto" key={i}>
                        {word}
                      </li>
                    ))
                  )}
                </ul>
                <p className="taboo-card__examples">
                  {card.examples?.length || 0}{' '}
                  {(card.examples?.length || 0) === 1 ? 'example' : 'examples'}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
