/**
 * The Clarity Map — Tool 04
 *
 * Separates confusion into clearer categories. Useful when a situation feels
 * overwhelming or tangled. Five columns: what I know, don't know, am assuming,
 * need to ask, and need to decide.
 *
 * ProtectedRoute required.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'

const CATEGORIES = [
  {
    id: 'know',
    title: 'What I know',
    prompt: 'Facts I am sure about — not fears dressed as facts.',
    colour: 'var(--navy)',
  },
  {
    id: 'dont_know',
    title: 'What I do not know',
    prompt: 'Genuine gaps. Information I'm missing.',
    colour: 'var(--charcoal)',
  },
  {
    id: 'assuming',
    title: 'What I am assuming',
    prompt: 'Things I am treating as fact — that may only be a fear or expectation.',
    colour: '#7A6030',
  },
  {
    id: 'need_to_ask',
    title: 'What I need to ask',
    prompt: 'Who do I need to speak to? What information would actually help?',
    colour: 'var(--navy)',
  },
  {
    id: 'need_to_decide',
    title: 'What I need to decide',
    prompt: 'What decisions are actually mine? What is not mine to decide?',
    colour: 'var(--navy)',
  },
]

const DEEPER_QUESTIONS = [
  'What am I treating as a fact, even though it may only be a fear?',
  'What is the next responsible step — separate from the full solution?',
  'Which decision is actually mine, and which belongs to someone else?',
]

export default function ClarityMap() {
  const [answers, setAnswers] = useState({})
  function setAnswer(id, val) { setAnswers(a => ({ ...a, [id]: val })) }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">

          <div className="journal-head">
            <div className="eyebrow">Tool 04 · Clarity</div>
            <h1>The Clarity Map</h1>
            <p className="pull">
              A single page for separating confusion into clearer categories — useful
              when a situation feels overwhelming or tangled. The aim is not to solve
              everything immediately. The aim is to see it.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
            {CATEGORIES.map((cat, i) => (
              <div key={cat.id} className="card" style={{ padding: '22px 26px', borderLeft: `3px solid ${cat.colour}` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--gold)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: 19,
                    color: 'var(--navy)', margin: 0,
                  }}>
                    {cat.title}
                  </h3>
                </div>
                <p style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55,
                  margin: '0 0 12px',
                }}>
                  {cat.prompt}
                </p>
                <textarea
                  value={answers[cat.id] ?? ''}
                  onChange={e => setAnswer(cat.id, e.target.value)}
                  rows={4}
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

          {/* Deeper questions */}
          <div style={{ maxWidth: 640, marginTop: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Deeper Questions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DEEPER_QUESTIONS.map((q, i) => (
                <p key={i} style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 15, color: 'var(--navy)', lineHeight: 1.6,
                  margin: 0, paddingLeft: 16,
                  borderLeft: '2px solid var(--gold)',
                }}>
                  {q}
                </p>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back to dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
