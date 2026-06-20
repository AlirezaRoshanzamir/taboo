import { useState } from 'react'
import { CARD_COLORS, DEFAULT_COLOR } from '../colors.js'

const EMPTY_TABOOS = ['', '', '', '', '']

export default function CardForm({ onAdd }) {
  const [guessWord, setGuessWord] = useState('')
  const [tabooWords, setTabooWords] = useState(EMPTY_TABOOS)
  const [color, setColor] = useState(DEFAULT_COLOR)

  function updateTaboo(index, value) {
    setTabooWords((prev) => prev.map((w, i) => (i === index ? value : w)))
  }

  function addTabooField() {
    setTabooWords((prev) => [...prev, ''])
  }

  function removeTabooField(index) {
    setTabooWords((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedGuess = guessWord.trim()
    const cleanTaboos = tabooWords.map((w) => w.trim()).filter(Boolean)
    if (!trimmedGuess) return

    onAdd({ guessWord: trimmedGuess, tabooWords: cleanTaboos, color })

    // Reset for the next card, but keep the chosen color so a batch of one
    // color can be entered quickly.
    setGuessWord('')
    setTabooWords(EMPTY_TABOOS)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__row">
        <label className="form__label" htmlFor="guess">
          Guess word
        </label>
        <input
          id="guess"
          className="form__input"
          type="text"
          dir="auto"
          value={guessWord}
          onChange={(e) => setGuessWord(e.target.value)}
          placeholder="The word to guess"
          autoComplete="off"
        />
      </div>

      <div className="form__row">
        <span className="form__label">Taboo words</span>
        <div className="form__taboos">
          {tabooWords.map((word, index) => (
            <div className="form__taboo" key={index}>
              <input
                className="form__input"
                type="text"
                dir="auto"
                value={word}
                onChange={(e) => updateTaboo(index, e.target.value)}
                placeholder={`Forbidden word ${index + 1}`}
                autoComplete="off"
              />
              {tabooWords.length > 1 && (
                <button
                  type="button"
                  className="form__icon-btn"
                  onClick={() => removeTabooField(index)}
                  aria-label="Remove this taboo word"
                  title="Remove"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="btn btn--ghost" onClick={addTabooField}>
          + Add taboo word
        </button>
      </div>

      <div className="form__row">
        <span className="form__label">Color</span>
        <div className="swatches">
          {CARD_COLORS.map((c) => (
            <button
              type="button"
              key={c.key}
              className={
                'swatch' + (color === c.key ? ' swatch--active' : '')
              }
              style={{ '--swatch': c.value }}
              onClick={() => setColor(c.key)}
              aria-pressed={color === c.key}
              title={c.label}
            >
              <span className="swatch__dot" />
              <span className="swatch__label">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="btn btn--primary" disabled={!guessWord.trim()}>
        Add card
      </button>
    </form>
  )
}
