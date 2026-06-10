/**
 * BarakahBase — public podcast hub page (/barakah-base)
 *
 * Displays all 8 Series 1 episodes as a browsable grid. Clicking any card
 * opens a modal with the opening question, 2 episode discussion questions,
 * and the 3 recurring anchor questions. No auth required.
 *
 * Data: src/lib/constants/barakah-episodes.js
 */

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BB_EPISODES, BB_ANCHORS } from '../lib/constants/barakah-episodes'
import MarketingHeader from '../components/MarketingHeader'
import Footer from '../components/Footer'

// Human-readable label for each icon key (used as eyebrow on cards)
const ICON_LABELS = {
  roots:      'Roots',
  book:       'Scripture',
  scales:     'Provision',
  heart:      'The Heart',
  knowledge:  'Knowledge',
  fitrah:     'Nature',
  mandala:    'Beauty',
  roundtable: 'Gathering',
}

// Zero-padded episode number display (01, 02 … 08)
function padNum(n) {
  return String(n).padStart(2, '0')
}

// ── Episode card ──────────────────────────────────────────────────────────────
function EpisodeCard({ ep, onClick }) {
  return (
    <button
      className="bb-card"
      onClick={onClick}
      aria-label={`Episode ${ep.n}: ${ep.title}`}
    >
      <div className="bb-card-icon">{ICON_LABELS[ep.icon] ?? ep.icon}</div>
      <div className="bb-card-num">{padNum(ep.n)}</div>
      <div className="bb-card-title">{ep.title}</div>
      <div className="bb-card-theme">{ep.theme}</div>
      <div className="bb-card-date">{ep.date}</div>
    </button>
  )
}

// ── Episode detail modal ──────────────────────────────────────────────────────
function EpisodeModal({ ep, onClose }) {
  // Close on Escape key
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return (
    <div
      className="bb-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bb-modal-title"
    >
      {/* Stop clicks inside modal from closing overlay */}
      <div className="bb-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="bb-modal-head">
          <button className="bb-modal-close" onClick={onClose} aria-label="Close">×</button>
          <div className="eyebrow">
            Episode {padNum(ep.n)} · {ep.theme}
          </div>
          <h2 id="bb-modal-title">{ep.title}</h2>
          <div style={{ fontSize: 12, color: 'rgba(245,238,217,0.55)', marginTop: 8, fontFamily: 'var(--font-body)' }}>
            {ep.date}
          </div>
        </div>

        {/* Body */}
        <div className="bb-modal-body">

          {/* Opening question — read before the episode */}
          <div className="bb-q-section">
            <div className="bb-q-label">Before you listen</div>
            <p className="bb-q-item">"{ep.opening}"</p>
          </div>

          {/* Episode-specific discussion questions */}
          <div className="bb-q-section">
            <div className="bb-q-label">Episode questions</div>
            <div>
              <div className="bb-q-num">Q1</div>
              <p className="bb-q-item">"{ep.q1}"</p>
            </div>
            <div>
              <div className="bb-q-num">Q2</div>
              <p className="bb-q-item">"{ep.q2}"</p>
            </div>
          </div>

          {/* Anchor questions — same across every episode */}
          <div className="bb-q-section">
            <div className="bb-q-label">Anchor questions · every episode</div>
            {BB_ANCHORS.map((q, i) => (
              <div key={i}>
                <div className="bb-q-num">A{i + 1}</div>
                <p className="bb-q-item">"{q}"</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BarakahBase() {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>

      <MarketingHeader variant="light" />

      {/* Hero */}
      <section className="bb-hero">
        <div className="eyebrow">Barakah Base · Series 1 · 2026</div>
        <h1>Where Strength Meets the Sacred</h1>
        <p className="lede">
          Eight conversations on faith, purpose, and the good life.
          July – October 2026.
        </p>
        <hr className="gold-rule" />
      </section>

      {/* Episode grid */}
      <section className="bb-episodes">
        <div className="bb-episodes-head">
          <div className="eyebrow" style={{ marginBottom: 8 }}>Series 1 · Eight Episodes</div>
          <h2>The conversations</h2>
        </div>
        <div className="bb-grid">
          {BB_EPISODES.map((ep) => (
            <EpisodeCard
              key={ep.n}
              ep={ep}
              onClick={() => setSelected(ep)}
            />
          ))}
        </div>
      </section>

      <Footer />

      {/* Episode detail modal */}
      {selected && (
        <EpisodeModal
          ep={selected}
          onClose={() => setSelected(null)}
        />
      )}

    </div>
  )
}
