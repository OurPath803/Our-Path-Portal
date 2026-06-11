/**
 * Progress Review — Tool 11
 *
 * Used at natural reflection points — end of a mentoring block, session milestone,
 * or any moment of review. Recognises growth, names what is still in process,
 * and surfaces what comes next.
 *
 * ProtectedRoute required.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'

const SECTIONS = [
  {
    id: 'shifted',
    title: 'What has shifted?',
    prompt: 'Not necessarily solved — shifted. What looks different now? What do you see or carry differently?',
  },
  {
    id: 'inprocess',
    title: 'What is still in process?',
    prompt: 'Progress is rarely linear. What is moving but not yet resolved? What still needs time or attention?',
  },
  {
    id: 'learned',
    title: 'What have I learned about myself?',
    prompt: 'Not lessons about the world — about you. Patterns, tendencies, capacities you had not fully seen before.',
  },
  {
    id: 'next',
    title: 'What comes next?',
    prompt: 'Not a full plan. Just the next faithful step — and what it requires of you.',
  },
]

const CLOSING_Q = 'If I could name one thing this period has asked of me, it would be…'

export default function ProgressReview() {
  const [answers, setAnswers] = useState({})
  const [closing, setClosing] = useState('')

  function setAnswer(id, val) { setAnswers(a => ({ ...a, [id]: val })) }

  const allFilled = SECTIONS.every(s => answers[s.id]?.trim())

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">

          <div className="journal-head">
            <div className="eyebrow">Tool 11 · Review</div>
            <h1>Progress Review</h1>
            <p className="pull">
              Progress is rarely linear. It often shows in changes of awareness, posture,
              and pattern — before it shows in outcomes. Recognise what is actually moving.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
            {SECTIONS.map((s, i) => (
              <div key={s.id} className="card" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
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
                  rows={5}
                  placeholder="Write honestly."
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

            {/* Closing reflection */}
            <div className="card" style={{ padding: '24px 28px', borderTop: '3px solid var(--gold)' }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Closing Reflection</div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 17, color: 'var(--navy)', lineHeight: 1.5,
                marginBottom: 14,
              }}>
                {CLOSING_Q}
              </label>
              <textarea
                value={closing}
                onChange={e => setClosing(e.target.value)}
                rows={3}
                placeholder="Complete the sentence."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 16, lineHeight: 1.75, resize: 'vertical',
                  border: '1px solid var(--line)', borderRadius: 4,
                  padding: '12px 14px', background: 'var(--off-white)',
                  color: 'var(--navy)', outline: 'none',
                }}
              />
            </div>
          </div>

          {allFilled && (
            <div style={{
              maxWidth: 640, marginTop: 24,
              padding: '16px 22px',
              background: 'var(--navy)', borderRadius: 4,
            }}>
              <p style={{ fontSize: 13, color: 'rgba(245,238,217,0.75)', margin: 0, fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
                Review complete. Share this with your mentor — or keep it for yourself.
              </p>
            </div>
          )}

          <div style={{ marginTop: 32 }}>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back to dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
