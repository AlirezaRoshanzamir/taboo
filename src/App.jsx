import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <span className="app__badge">Board game tools</span>
        <h1 className="app__title">Taboo</h1>
        <p className="app__subtitle">
          A simple generator for Taboo board game cards.
        </p>
      </header>

      <main className="app__main">
        <section className="card">
          <h2 className="card__heading">Coming soon</h2>
          <p className="card__text">
            The project is set up and ready. Game logic and the card
            generator will live here.
          </p>
        </section>
      </main>

      <footer className="app__footer">
        <p>Built with React + Vite</p>
      </footer>
    </div>
  )
}
