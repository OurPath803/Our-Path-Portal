/**
 * Energy & Capacity Audit — Tool 08
 *
 * For people who are functioning, but stretched. A page for noticing what is
 * draining, sustaining, overloading — before pushing for more action.
 *
 * ProtectedRoute required.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'

const AUDIT_SECTIONS = [
  {
    id: 'draining',
    title: 'What is draining me?',
    prompt: 'Roles, relationships, situations, habits — anything that consistently costs more than it gives.',
    colour: '#C0392B',
  },
  {
    id: 'sustaining',
    title: 'What is sustaining me?',
    prompt: 'What actually replenishes you? Not what should — what does, in practice?',
    colour: 'var(--success)',
  },
  {
    id: 'overloading',
    title: 'What is overloading me?',
    prompt: 'Where is the weight above your current capacity? Not bad things — just too much.',
    colour: '#E67E22',
  },
]

const CAPACITY_QUESTIONS = [
  { id: 'sleep',    label: 'Sleep and physical rest', low: 'Depleted', high: 'Good' },
  { id: 'time',     label: 'Time — enough margin', low: 'No margin', high: 'Spacious' },
  { id: 'mental',   label: 'Mental bandwidth', low: 'Stretched', high: 'Clear' },
  { id: 'spiritual', label: 'Spiritual connection', low: 'Distant', high: 'Present' },
  { id: 'relational', label: 'Relational support', low: 'Isolated', high: 'Held' },
]

export default function EnergyAudit() {
  const [auditAnswers, setAuditAnswers] = useState({})
  const [capacityScores, setCapacityScores] = useState({})
  const [nextStep, setNextStep] = useState('')

  function setAuditAnswer(id, val) { setAuditAnswers(a => ({ ...a, [id]: val })) }
  function setCapacity(id, val) { setCapacityScores(s => ({ ...s, [id]: val })) }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">

          <div className="journal-head">
            <div className="eyebrow">Tool 08 · Capacity</div>
            <h1>Energy &amp; Capacity Audit</h1>
            <p className="pull">
              For people who are functioning, but stretched. Sometimes the next responsible
              step is not more action — it is honest acknowledgement of what is actually available.
            </p>
          </div>

          {/* Audit sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
            {AUDIT_SECTIONS.map(s => (
              <div key={s.id} className="card" style={{ padding: '22px 26px', borderLeft: `3px solid ${s.colour}` }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--navy)', margin: '0 0 8px' }}>
                  {s.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55, margin: '0 0 12px',
                }}>
                  {s.prompt}
                </p>
                <textarea
                  value={auditAnswers[s.id] ?? ''}
                  onChange={e => setAuditAnswer(s.id, e.target.value)}
                  rows={4}
                  placeholder="List what comes to mind."
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

          {/* Capacity review — 5-point sliders */}
          <div style={{ maxWidth: 640, marginTop: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Capacity Review</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {CAPACITY_QUESTIONS.map(q => (
                <div key={q.id} className="card" style={{ padding: '18px 22px' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 10,
                  }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--navy)', fontWeight: 500 }}>
                      {q.label}
                    </span>
                    {capacityScores[q.id] && (
                      <span style={{ fontSize: 12, color: 'var(--gold)' }}>
                        {capacityScores[q.id]}/5
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        onClick={() => setCapacity(q.id, v)}
                        style={{
                          flex: 1, padding: '8px 4px',
                          border: `1px solid ${capacityScores[q.id] === v ? 'var(--navy)' : 'var(--line)'}`,
                          borderRadius: 4,
                          background: capacityScores[q.id] === v ? 'var(--navy)' : 'var(--cream)',
                          color: capacityScores[q.id] === v ? 'var(--cream)' : 'var(--charcoal)',
                          fontFamily: 'var(--font-body)', fontSize: 14,
                          cursor: 'pointer', transition: 'all 0.12s',
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 11, color: 'var(--mute)', marginTop: 5,
                    fontFamily: 'var(--font-body)',
                  }}>
                    <span>{q.low}</span><span>{q.high}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next step */}
          <div style={{ maxWidth: 640, marginTop: 32 }}>
            <div className="card" style={{ padding: '22px 26px' }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 17, color: 'var(--navy)', lineHeight: 1.5, marginBottom: 12,
              }}>
                Given what I see here, the most responsible next step is…
              </label>
              <textarea
                value={nextStep}
                onChange={e => setNextStep(e.target.value)}
                rows={3}
                placeholder="Not a plan — just the next step."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 15, lineHeight: 1.7, resize: 'vertical',
                  border: '1px solid var(--line)', borderRadius: 4,
                  padding: '12px 14px', background: 'var(--off-white)',
                  color: 'var(--navy)', outline: 'none',
                }}
              />
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
