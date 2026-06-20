import { useEffect, useState } from 'react'
import './App.css'
import { loadCards, saveCards, makeId } from './storage.js'
import CardForm from './components/CardForm.jsx'
import CardList from './components/CardList.jsx'
import Toolbar from './components/Toolbar.jsx'
import PrintPanel from './components/PrintPanel.jsx'

export default function App() {
  const [cards, setCards] = useState(loadCards)

  // Persist on every change so a refresh never loses work.
  useEffect(() => {
    saveCards(cards)
  }, [cards])

  function addCard(card) {
    setCards((prev) => [...prev, { id: makeId(), ...card }])
  }

  function deleteCard(id) {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  function importCards(incoming) {
    if (incoming.length === 0) {
      alert('No valid cards found in that file.')
      return
    }
    if (cards.length === 0) {
      setCards(incoming)
      return
    }
    const merge = window.confirm(
      `You have ${cards.length} card(s) already.\n\n` +
        'OK = merge the uploaded cards with your current ones.\n' +
        'Cancel = replace your current cards with the uploaded ones.',
    )
    setCards(merge ? [...cards, ...incoming] : incoming)
  }

  function clearAll() {
    if (window.confirm('Delete all cards? This cannot be undone.')) {
      setCards([])
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__badge">Board game tools</span>
        <h1 className="app__title">Taboo</h1>
        <p className="app__subtitle">
          Create, save, and share your own Taboo cards.
        </p>
      </header>

      <main className="app__main">
        <section className="panel">
          <h2 className="panel__heading">Add a card</h2>
          <CardForm onAdd={addCard} />
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__heading">
              Your cards <span className="panel__count">{cards.length}</span>
            </h2>
            <Toolbar cards={cards} onImport={importCards} onClear={clearAll} />
          </div>
          <CardList cards={cards} onDelete={deleteCard} />
        </section>

        <PrintPanel cards={cards} />
      </main>

      <footer className="app__footer">
        <p>Built with React + Vite · Saved automatically in your browser</p>
      </footer>
    </div>
  )
}
