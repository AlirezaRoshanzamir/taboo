import { useMemo, useState } from 'react'
import { CARD_COLORS, colorLabel, colorValue } from '../colors.js'
import './print.css'

const PAGE_PRESETS = {
  // [short edge, long edge] in mm
  A3: [297, 420],
  A4: [210, 297],
  A5: [148, 210],
}

const SCALE_OPTIONS = [0.25, 0.4, 0.6, 1]

function pageDims(size, orientation, customW, customH) {
  if (size === 'custom') return [customW, customH]
  const [short, long] = PAGE_PRESETS[size]
  return orientation === 'landscape' ? [long, short] : [short, long]
}

// Choose four starting colors: those present in the collection first, then the
// rest of the palette to fill up to four roles.
function initialRoles(cards) {
  const order = CARD_COLORS.map((c) => c.key)
  const seen = new Set()
  const picked = []
  for (const k of order) {
    if (cards.some((c) => c.color === k)) {
      picked.push(k)
      seen.add(k)
    }
  }
  for (const c of cards) {
    if (!seen.has(c.color)) {
      picked.push(c.color)
      seen.add(c.color)
    }
  }
  for (const k of order) {
    if (picked.length >= 4) break
    if (!seen.has(k)) {
      picked.push(k)
      seen.add(k)
    }
  }
  while (picked.length < 4) picked.push(order[picked.length % order.length])
  return { s1t: picked[0], s1b: picked[1], s2t: picked[2], s2b: picked[3] }
}

// Shrink the taboo words so they always fit the (roughly half-card) section
// without touching the divider, scaling down as the word count grows.
function tabooFontSize(cardH, count) {
  const baseTfs = Math.max(2.6, cardH * 0.05)
  if (count <= 0) return baseTfs
  const gfs = Math.max(3, cardH * 0.064)
  const sectionH = cardH / 2
  // Space taken by the guess word block (text + padding + white divider).
  const guessBlock = gfs * 1.3 + cardH * 0.05 + 0.5
  const taboosPadding = 4 // 2mm top + 2mm bottom
  const available = Math.max(0, sectionH - guessBlock - taboosPadding)
  const perLine = 1.45 // line-height + inter-line gap factor
  const fit = available / (count * perLine)
  return Math.max(2, Math.min(baseTfs, Number(fit.toFixed(2))))
}

function Section({ card, cardH }) {
  if (!card) return <div className="pc__sec-inner pc__sec-inner--empty" />
  return (
    <div className="pc__sec-inner">
      <div className="pc__guess" dir="auto">
        {card.guessWord}
      </div>
      <ul
        className="pc__taboos"
        style={{ '--tfs': tabooFontSize(cardH, card.tabooWords.length) }}
      >
        {card.tabooWords.map((w, i) => (
          <li className="pc__taboo" dir="auto" key={i}>
            {w}
          </li>
        ))}
      </ul>
    </div>
  )
}

function PrintCard({ topCard, bottomCard, topColor, bottomColor, cardH }) {
  return (
    <div className="pc">
      <div className="pc__sec" style={{ '--c': colorValue(topColor) }}>
        <Section card={topCard} cardH={cardH} />
      </div>
      <div className="pc__sec pc__sec--flip" style={{ '--c': colorValue(bottomColor) }}>
        <Section card={bottomCard} cardH={cardH} />
      </div>
    </div>
  )
}

export default function PrintPanel({ cards }) {
  const [size, setSize] = useState('A4')
  const [orientation, setOrientation] = useState('portrait')
  const [customW, setCustomW] = useState(210)
  const [customH, setCustomH] = useState(297)
  const [cardW, setCardW] = useState(62)
  const [cardH, setCardH] = useState(96)
  const [gap, setGap] = useState(0)
  const [margin, setMargin] = useState(0)
  const [mirrorBack, setMirrorBack] = useState(true)
  const [roles, setRoles] = useState(() => initialRoles(cards))
  const [scale, setScale] = useState(0.6)

  const colorOptions = useMemo(() => {
    const keys = CARD_COLORS.map((c) => c.key)
    const set = new Set(keys)
    for (const c of cards) {
      if (!set.has(c.color)) {
        set.add(c.color)
        keys.push(c.color)
      }
    }
    return keys
  }, [cards])

  const groups = useMemo(() => {
    const m = {}
    for (const c of cards) (m[c.color] ||= []).push(c)
    return m
  }, [cards])

  const [pw, ph] = pageDims(size, orientation, customW, customH)

  const cols = Math.max(1, Math.floor((pw - 2 * margin + gap) / (cardW + gap)))
  const rows = Math.max(1, Math.floor((ph - 2 * margin + gap) / (cardH + gap)))
  const perPage = cols * rows

  const roleKeys = [roles.s1t, roles.s1b, roles.s2t, roles.s2b]
  const lists = roleKeys.map((k) => groups[k] || [])
  const count = lists.reduce((max, l) => Math.max(max, l.length), 0)

  const physical = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      s1t: lists[0][i] || null,
      s1b: lists[1][i] || null,
      s2t: lists[2][i] || null,
      s2b: lists[3][i] || null,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, roles, count])

  const pages = useMemo(() => {
    const out = []
    for (let i = 0; i < physical.length; i += perPage) {
      const chunk = physical.slice(i, i + perPage)
      out.push({ side: 1, cards: chunk, mirror: false })
      out.push({ side: 2, cards: chunk, mirror: mirrorBack })
    }
    return out
  }, [physical, perPage, mirrorBack])

  const pageVars = {
    '--pw': pw,
    '--ph': ph,
    '--cw': cardW,
    '--ch': cardH,
    '--cols': cols,
    '--gap': gap,
    '--margin': margin,
    '--s': scale,
    '--gfs': Number(Math.max(3, cardH * 0.064).toFixed(2)),
    '--tfs': Number(Math.max(2.6, cardH * 0.05).toFixed(2)),
  }

  const setRole = (key, value) => setRoles((prev) => ({ ...prev, [key]: value }))

  if (cards.length === 0) {
    return (
      <section className="panel print-panel">
        <h2 className="panel__heading">Print / Export PDF</h2>
        <p className="empty">Add some cards first, then come back to print them.</p>
      </section>
    )
  }

  return (
    <section className="panel print-panel">
      <style>{`@page { size: ${pw}mm ${ph}mm; margin: 0; }`}</style>

      <div className="print-panel__controls">
        <h2 className="panel__heading">Print / Export PDF</h2>

        <div className="pp-group">
          <h3 className="pp-group__title">Page</h3>
          <div className="pp-controls">
            <div className="pp-field">
              <label htmlFor="pp-size">Page size</label>
              <select
                id="pp-size"
                className="pp-select"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                <option value="A3">A3</option>
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="pp-field">
              <label htmlFor="pp-orient">Orientation</label>
              <select
                id="pp-orient"
                className="pp-select"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                disabled={size === 'custom'}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div className="pp-field">
              <label htmlFor="pp-pw">Page width (mm)</label>
              <input
                id="pp-pw"
                className="pp-input"
                type="number"
                min={50}
                value={size === 'custom' ? customW : pw}
                onChange={(e) => setCustomW(Number(e.target.value))}
                disabled={size !== 'custom'}
              />
            </div>
            <div className="pp-field">
              <label htmlFor="pp-ph">Page height (mm)</label>
              <input
                id="pp-ph"
                className="pp-input"
                type="number"
                min={50}
                value={size === 'custom' ? customH : ph}
                onChange={(e) => setCustomH(Number(e.target.value))}
                disabled={size !== 'custom'}
              />
            </div>
            <div className="pp-field">
              <label htmlFor="pp-margin">Page margin (mm)</label>
              <input
                id="pp-margin"
                className="pp-input"
                type="number"
                min={0}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="pp-group">
          <h3 className="pp-group__title">Card</h3>
          <div className="pp-controls">
            <div className="pp-field">
              <label htmlFor="pp-cw">Card width (mm)</label>
              <input
                id="pp-cw"
                className="pp-input"
                type="number"
                min={20}
                value={cardW}
                onChange={(e) => setCardW(Number(e.target.value))}
              />
            </div>
            <div className="pp-field">
              <label htmlFor="pp-ch">Card height (mm)</label>
              <input
                id="pp-ch"
                className="pp-input"
                type="number"
                min={20}
                value={cardH}
                onChange={(e) => setCardH(Number(e.target.value))}
              />
            </div>
            <div className="pp-field">
              <label htmlFor="pp-gap">Gap between cards (mm)</label>
              <input
                id="pp-gap"
                className="pp-input"
                type="number"
                min={0}
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="pp-group">
          <h3 className="pp-group__title">Colors (4 required)</h3>
          <div className="pp-roles">
            <RoleSelect
              label="Side 1 · top"
              value={roles.s1t}
              onChange={(v) => setRole('s1t', v)}
              options={colorOptions}
            />
            <RoleSelect
              label="Side 1 · bottom"
              value={roles.s1b}
              onChange={(v) => setRole('s1b', v)}
              options={colorOptions}
            />
            <RoleSelect
              label="Side 2 · top"
              value={roles.s2t}
              onChange={(v) => setRole('s2t', v)}
              options={colorOptions}
            />
            <RoleSelect
              label="Side 2 · bottom"
              value={roles.s2b}
              onChange={(v) => setRole('s2b', v)}
              options={colorOptions}
            />
          </div>
          <label className="pp-checkbox">
            <input
              type="checkbox"
              checked={mirrorBack}
              onChange={(e) => setMirrorBack(e.target.checked)}
            />
            Mirror back pages for double-sided printing (long-edge flip)
          </label>
        </div>

        <p className="pp-summary">
          Layout: {cols}×{rows} = {perPage} cards/page · {count} card(s) per color ·{' '}
          {pages.length} page(s) total ({pages.length / 2} sheet(s) × 2 sides).
          Odd pages = Side 1, even pages = Side 2.
        </p>

        <button
          type="button"
          className="btn btn--primary"
          onClick={() => window.print()}
          disabled={count === 0}
        >
          🖨 Print / Save as PDF
        </button>
      </div>

      <div className="print-panel__preview-head">
        <h3>Preview</h3>
        <div className="pp-scale">
          {SCALE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={scale === s ? 'is-active' : ''}
              onClick={() => setScale(s)}
            >
              {Math.round(s * 100)}%
            </button>
          ))}
        </div>
      </div>

      <div className="print-pages" style={pageVars}>
        {pages.map((page, pi) => (
          <div className="pp-wrap" key={pi}>
            <div className={'print-page' + (page.mirror ? ' print-page--mirror' : '')}>
              <div className="print-page__grid">
                {page.cards.map((pc, ci) =>
                  page.side === 1 ? (
                    <PrintCard
                      key={ci}
                      topCard={pc.s1t}
                      bottomCard={pc.s1b}
                      topColor={roles.s1t}
                      bottomColor={roles.s1b}
                      cardH={cardH}
                    />
                  ) : (
                    <PrintCard
                      key={ci}
                      topCard={pc.s2t}
                      bottomCard={pc.s2b}
                      topColor={roles.s2t}
                      bottomColor={roles.s2b}
                      cardH={cardH}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RoleSelect({ label, value, onChange, options }) {
  return (
    <div className="pp-field">
      <span className="pp-field__label">{label}</span>
      <select
        className="pp-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((k) => (
          <option key={k} value={k}>
            {colorLabel(k)}
          </option>
        ))}
      </select>
    </div>
  )
}
