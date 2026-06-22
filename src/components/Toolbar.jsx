import { useRef } from 'react'
import { isValidCard, makeId } from '../storage.js'

export default function Toolbar({ cards, onImport, onClear }) {
  const fileInputRef = useRef(null)

  function handleDownload() {
    const json = JSON.stringify(cards, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'taboo-cards.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!Array.isArray(parsed)) {
          throw new Error('File must contain a JSON array of cards.')
        }
        const valid = parsed.filter(isValidCard).map((card) => ({
          id: typeof card.id === 'string' ? card.id : makeId(),
          guessWord: card.guessWord,
          tabooWords: card.tabooWords.map((t) => ({
            word: t.word,
            difficulty: t.difficulty,
          })),
          examples: card.examples,
          color: card.color,
        }))
        onImport(valid)
      } catch (err) {
        alert('Could not read that file: ' + err.message)
      }
    }
    reader.readAsText(file)
    // Reset so selecting the same file again re-triggers change.
    event.target.value = ''
  }

  return (
    <div className="toolbar">
      <button
        type="button"
        className="btn btn--ghost"
        onClick={handleDownload}
        disabled={cards.length === 0}
      >
        ⬇ Download JSON
      </button>
      <button type="button" className="btn btn--ghost" onClick={handleUploadClick}>
        ⬆ Upload JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="btn btn--danger"
        onClick={onClear}
        disabled={cards.length === 0}
      >
        Clear all
      </button>
    </div>
  )
}
