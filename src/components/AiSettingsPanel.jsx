// Lets the user point the "magic" card generator at any OpenAI-compatible
// endpoint (hosted or local) and choose the model.
export default function AiSettingsPanel({ settings, onChange }) {
  const set = (key) => (e) => onChange({ ...settings, [key]: e.target.value })
  const setNum = (key) => (e) =>
    onChange({ ...settings, [key]: Number(e.target.value) })

  return (
    <section className="panel">
      <h2 className="panel__heading">AI settings</h2>
      <div className="pp-group">
        <p className="form__hint">
          Used by the ✨ button next to the guess word to auto-fill examples and
          taboo words. Settings are saved in your browser only.
        </p>
        <div className="pp-controls">
          <div className="pp-field">
            <label htmlFor="ai-url">Base URL</label>
            <input
              id="ai-url"
              className="pp-input"
              type="text"
              value={settings.baseUrl}
              onChange={set('baseUrl')}
              placeholder="https://api.openai.com/v1"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="pp-field">
            <label htmlFor="ai-key">API key</label>
            <input
              id="ai-key"
              className="pp-input"
              type="password"
              value={settings.apiKey}
              onChange={set('apiKey')}
              placeholder="sk-…"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="pp-field">
            <label htmlFor="ai-model">Model</label>
            <input
              id="ai-model"
              className="pp-input"
              type="text"
              value={settings.model}
              onChange={set('model')}
              placeholder="gpt-4o-mini"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="pp-field">
            <label htmlFor="ai-in-price">Input price ($ / 1M tokens)</label>
            <input
              id="ai-in-price"
              className="pp-input"
              type="number"
              min={0}
              step="0.01"
              value={settings.inputPrice}
              onChange={setNum('inputPrice')}
            />
          </div>
          <div className="pp-field">
            <label htmlFor="ai-out-price">Output price ($ / 1M tokens)</label>
            <input
              id="ai-out-price"
              className="pp-input"
              type="number"
              min={0}
              step="0.01"
              value={settings.outputPrice}
              onChange={setNum('outputPrice')}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
