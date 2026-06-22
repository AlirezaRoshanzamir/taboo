import { useEffect, useState } from 'react'
import { CARD_COLORS, DEFAULT_COLOR } from '../colors.js'
import { generateCardContent } from '../ai.js'
import { DIFFICULTIES, DIFFICULTY_LABELS } from '../difficulty.js'

// The blank form pre-seeds a sensible spread so the most common case (mostly
// easy words, a couple harder ones) is one keystroke away.
function emptyTaboos() {
  return Array.from({ length: 5 }, () => ({ word: '', difficulty: 'easy' }))
}

function emptyExamples() {
  return ['']
}

export default function CardForm({
  editingCard,
  onAdd,
  onUpdate,
  onCancelEdit,
  aiSettings,
}) {
  const isEditing = Boolean(editingCard)

  const [guessWord, setGuessWord] = useState('')
  const [tabooWords, setTabooWords] = useState(emptyTaboos)
  const [examples, setExamples] = useState(emptyExamples)
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [aiBusy, setAiBusy] = useState(false)
  const [aiUsage, setAiUsage] = useState(null)

  const aiReady =
    Boolean(guessWord.trim()) &&
    Boolean(aiSettings?.baseUrl?.trim()) &&
    Boolean(aiSettings?.apiKey?.trim()) &&
    Boolean(aiSettings?.model?.trim())

  async function generateWithAi() {
    if (!aiReady || aiBusy) return
    setAiBusy(true)
    try {
      const {
        examples: aiExamples,
        tabooWords: aiTaboos,
        usage,
      } = await generateCardContent(guessWord.trim(), aiSettings)
      setExamples(aiExamples.length > 0 ? aiExamples : emptyExamples())
      setTabooWords(aiTaboos.length > 0 ? aiTaboos : emptyTaboos())
      setAiUsage(usage)
    } catch (err) {
      alert(`Could not generate card content.\n\n${err.message}`)
    } finally {
      setAiBusy(false)
    }
  }

  useEffect(() => {
    if (editingCard) {
      setGuessWord(editingCard.guessWord)
      setTabooWords(
        editingCard.tabooWords.length > 0
          ? editingCard.tabooWords.map((t) => ({ ...t }))
          : emptyTaboos(),
      )
      setExamples(
        editingCard.examples.length > 0 ? editingCard.examples : emptyExamples(),
      )
      setColor(editingCard.color)
    } else {
      setGuessWord('')
      setTabooWords(emptyTaboos())
      setExamples(emptyExamples())
    }
  }, [editingCard])

  function updateTaboo(index, patch) {
    setTabooWords((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    )
  }

  function addTabooField(difficulty = 'easy') {
    setTabooWords((prev) => [...prev, { word: '', difficulty }])
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

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedGuess = guessWord.trim()
    if (!trimmedGuess) return

    const cleanTaboos = tabooWords
      .map((t) => ({ word: t.word.trim(), difficulty: t.difficulty }))
      .filter((t) => t.word)
    const cleanExamples = examples.map((e) => e.trim()).filter(Boolean)

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
      setGuessWord('')
      setTabooWords(emptyTaboos())
      setExamples(emptyExamples())
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
        <div className="form__guess">
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
          {aiReady && (
            <button
              type="button"
              className="form__magic-btn"
              onClick={generateWithAi}
              disabled={aiBusy}
              aria-label="Generate examples and taboo words with AI"
              title="Generate examples and taboo words with AI"
            >
              {aiBusy ? '…' : '✨'}
            </button>
          )}
        </div>
        {aiUsage && (
          <p className="form__hint form__ai-cost">
            ✨ Last generation: ${aiUsage.cost.toFixed(4)} ·{' '}
            {aiUsage.totalTokens.toLocaleString()} tokens (
            {aiUsage.inputTokens.toLocaleString()} in /{' '}
            {aiUsage.outputTokens.toLocaleString()} out)
          </p>
        )}
      </div>

      <div className="form__row">
        <span className="form__label">Taboo words</span>
        <p className="form__hint">
          Each word has its own difficulty. A printed card at level X shows every
          word ranked X or easier.
        </p>
        <div className="form__taboos">
          {tabooWords.map((taboo, index) => (
            <div className="form__taboo" key={index}>
              <input
                className="form__input"
                type="text"
                dir="auto"
                value={taboo.word}
                onChange={(e) => updateTaboo(index, { word: e.target.value })}
                placeholder={`Taboo word ${index + 1}`}
                autoComplete="off"
              />
              <select
                className={`form__diff form__diff--${taboo.difficulty}`}
                value={taboo.difficulty}
                onChange={(e) =>
                  updateTaboo(index, { difficulty: e.target.value })
                }
                aria-label="Difficulty"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </option>
                ))}
              </select>
              {tabooWords.length > 1 && (
                <button
                  type="button"
                  className="form__icon-btn"
                  onClick={() => removeTabooField(index)}
                  aria-label="Remove this taboo word"
                  title="Remove"
                  tabIndex={-1}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => addTabooField('easy')}
        >
          + Add taboo word
        </button>
      </div>

      <div className="form__row">
        <span className="form__label">Examples</span>
        <p className="form__hint">
          Natural descriptions of the guess word — add as many as you like.
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
                placeholder={`Example ${index + 1}`}
              />
              {examples.length > 1 && (
                <button
                  type="button"
                  className="form__icon-btn"
                  onClick={() => removeExampleField(index)}
                  aria-label="Remove this example"
                  title="Remove"
                  tabIndex={-1}
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
