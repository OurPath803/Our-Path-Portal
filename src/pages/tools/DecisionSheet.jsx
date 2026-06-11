/**
 * Decision Discernment Sheet — Tool 06
 *
 * For decisions where faith, family, ambition, fear, and uncertainty overlap.
 * A structure to separate what is known, what is feared, and what is required.
 *
 * This is not about making the decision — it is about helping you recognise
 * what is actually driving it, and what clarity you already have.
 *
 * ProtectedRoute required.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'

const SECTIONS = [
  {
    id: 'decision',
    title: 'Define the decision',
    prompt: 'State it plainly. What is the actual choice you are facing? Not the context — the decision itself.',
    rows: 3,
  },
  {
    id: 'options',
    title: 'Options',
    prompt: 'List the options as you currently see them — including the option of doing nothing, or waiting.',
    rows: 5,
  },
  {
    id: 'pressures',
    title: 'Pressures and fears',
    prompt: 'What is pushing you toward or away from each option? Name the pressure, not just the preference.',
    rows: 5,
  },
  {
    id: 'values',
    title: 'Values and faith',
    prompt: 'What do your values say here? What would a decision made from tawakkul — trust and right action — look like?',
    rows: 5,
  },
  {
    id: 'next_step',
    title: 'Next step',
    prompt: 'Not the full answer. Just the next responsible step — what you can take now, without needing everything resolved first.',
    rows: 3,
  },
]

export default function DecisionSheet() {
  const [answers, setAnswers] = useState({})
  function setAnswer(id, val) { setAnswers(a => ({ ...a, [id]: val })) }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">

          <div className="journal-head">
            <div className="eyebrow">Tool 06 · Discernment</div>
            <h1>Decision Discernment Sheet</h1>
            <p className="pull">
              For decisions where faith, family, ambition, fear, and uncertainty overlap.
              A structure to separate what is known, what is feared, and what is required.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
            {SECTIONS.map((s, i) => (
              <div key={s.id} className="card" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--gold)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: 20,
                    color: 'var(--navy)', margin: 0,
                  }}>
                    {s.title}
                  </h3>
                </div>
                <p style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6,
                  margin: '0 0 14px',
                }}>
                  {s.prompt}
                </p>
                <textarea
                  value={answers[s.id] ?? ''}
                  onChange={e => setAnswer(s.id, e.target.value)}
                  rows={s.rows}
                  placeholder="Write freely."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    fontFamily: 'var(--font-body)', fontSize: 15,
                    lineHeight: 1.7, resize: 'vertical',
                    border: '1px solid var(--line)', borderRadius: 4,
                    padding: '12px 14px', background: 'var(--off-white)',
                    color: 'var(--charcoal)', outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{
            maxWidth: 640, marginTop: 24,
            padding: '16px 22px',
            borderLeft: '3px solid var(--gold)',
            background: 'var(--off-white)',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 15, color: 'var(--navy)', lineHeight: 1.6, margin: 0,
            }}>
              This is not about making the decision for you. It is about helping you recognise
              what you already know, what you actually fear, and what the next responsible step is.
            </p>
          </div>

          <div style={{ marginTop: 32 }}>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back to dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
