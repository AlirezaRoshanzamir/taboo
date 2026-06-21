import { useEffect, useState } from 'react'
import { CARD_COLORS, DEFAULT_COLOR } from '../colors.js'

const EMPTY_TABOOS = ['', '', '', '', '']
const EMPTY_EXAMPLES = ['']

// Pull every word/phrase wrapped in **double asterisks** out of a sentence.
function extractMarkedWords(text) {
  const matches = text.matchAll(/\*\*(.+?)\*\*/g)
  return Array.from(matches, (m) => m[1].trim()).filter(Boolean)
}

export default function CardForm({ editingCard, onAdd, onUpdate, onCancelEdit }) {
  const isEditing = Boolean(editingCard)

  const [guessWord, setGuessWord] = useState('')
  const [tabooWords, setTabooWords] = useState(EMPTY_TABOOS)
  const [examples, setExamples] = useState(EMPTY_EXAMPLES)
  const [color, setColor] = useState(DEFAULT_COLOR)

  // Sync the form to whatever we're editing. When editing is cleared, reset to
  // a blank "add" form.
  useEffect(() => {
    if (editingCard) {
      setGuessWord(editingCard.guessWord)
      setTabooWords(
        editingCard.tabooWords.length > 0 ? editingCard.tabooWords : EMPTY_TABOOS,
      )
      setExamples(
        editingCard.examples?.length > 0 ? editingCard.examples : EMPTY_EXAMPLES,
      )
      setColor(editingCard.color)
    } else {
      setGuessWord('')
      setTabooWords(EMPTY_TABOOS)
      setExamples(EMPTY_EXAMPLES)
    }
  }, [editingCard])

  function updateTaboo(index, value) {
    setTabooWords((prev) => prev.map((w, i) => (i === index ? value : w)))
  }

  function addTabooField() {
    setTabooWords((prev) => [...prev, ''])
  }

  function removeTabooField(index) {
    setTabooWords((prev) => prev.filter((_, i) => i !== index))
  }

  function updateExample(index, value) {
    setExamples((prev) => prev.map((e, i) => (i === index ? value : e)))
  }

  function addExampleField() {
    setExamples((prev) => [...prev, ''])
  }

  function removeExampleField(index) {
    setExamples((prev) => prev.filter((_, i) => i !== index))
  }

  // Collect **marked** words across all examples and append the ones not
  // already present (case-insensitive), de-duplicating repeats along the way.
  function addTaboosFromExamples() {
    const marked = examples.flatMap(extractMarkedWords)
    if (marked.length === 0) return

    setTabooWords((prev) => {
      const existing = new Set(
        prev.map((w) => w.trim().toLowerCase()).filter(Boolean),
      )
      // Drop blank trailing fields so appended words don't leave gaps.
      const next = prev.filter((w) => w.trim())
      for (const word of marked) {
        const key = word.toLowerCase()
        if (existing.has(key)) continue
        existing.add(key)
        next.push(word)
      }
      return next.length > 0 ? next : prev
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedGuess = guessWord.trim()
    const cleanTaboos = tabooWords.map((w) => w.trim()).filter(Boolean)
    const cleanExamples = examples.map((e) => e.trim()).filter(Boolean)
    if (!trimmedGuess) return

    const payload = {
      guessWord: trimmedGuess,
      tabooWords: cleanTaboos,
      examples: cleanExamples,
      color,
    }

    if (isEditing) {
      onUpdate({ id: editingCard.id, ...payload })
    } else {
      onAdd(payload)
      // Reset for the next card, but keep the chosen color so a batch of one
      // color can be entered quickly.
      setGuessWord('')
      setTabooWords(EMPTY_TABOOS)
      setExamples(EMPTY_EXAMPLES)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__row">
        <label className="form__label" htmlFor="card-id">
          Card ID
        </label>
        <input
          id="card-id"
          className="form__input form__input--frozen"
          type="text"
          value={isEditing ? editingCard.id : ''}
          placeholder="Assigned automatically on add"
          readOnly
          tabIndex={-1}
        />
      </div>

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
        <span className="form__label">Examples</span>
        <p className="form__hint">
          One description per line. Wrap key words in{' '}
          <code>**double asterisks**</code> to mark them as taboo candidates.
        </p>
        <div className="form__examples">
          {examples.map((example, index) => (
            <div className="form__example" key={index}>
              <textarea
                className="form__input form__textarea"
                dir="auto"
                rows={2}
                value={example}
                onChange={(e) => updateExample(index, e.target.value)}
                placeholder={`The thing that we open **door** with.`}
              />
              {examples.length > 1 && (
                <button
                  type="button"
                  className="form__icon-btn"
                  onClick={() => removeExampleField(index)}
                  aria-label="Remove this example"
                  title="Remove"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="form__example-actions">
          <button type="button" className="btn btn--ghost" onClick={addExampleField}>
            + Add example
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={addTaboosFromExamples}
          >
            ⤵ Add taboo words from examples
          </button>
        </div>
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

      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={!guessWord.trim()}>
          {isEditing ? 'Save changes' : 'Add card'}
        </button>
        {isEditing && (
          <button type="button" className="btn btn--ghost" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
