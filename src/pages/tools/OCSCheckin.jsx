/**
 * OCS Check-In — OurPath Check-In Scale
 * 5 dimensions scored 1–5. Gated tool: ProtectedRoute required.
 * Data saving deferred to next pass; this pass renders the framework.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { OCS_DIMENSIONS, OCS_SCALE } from '../../lib/constants/frameworks'

const SCALE_LABELS = {
  1: 'Absent',
  2: 'Flickering',
  3: 'Present but fragile',
  4: 'Stable',
  5: 'Integrated',
}

export default function OCSCheckin() {
  const [scores, setScores] = useState(
    Object.fromEntries(OCS_DIMENSIONS.map(d => [d.id, 0]))
  )

  function setScore(id, val) {
    setScores(s => ({ ...s, [id]: val }))
  }

  const allScored = OCS_DIMENSIONS.every(d => scores[d.id] > 0)

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div className="journal-head">
            <div className="eyebrow">OurPath Check-In Scale · OCS</div>
            <h1>How are you right now?</h1>
            <p className="pull">
              Rate each dimension honestly. There are no right answers — this is a
              snapshot, not an assessment.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 640 }}>
            {OCS_DIMENSIONS.map(dim => (
              <div key={dim.id} className="card" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 20,
                      color: 'var(--navy)',
                      margin: 0,
                    }}>
                      {dim.label}
                    </h3>
                    <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 2 }}>
                      {dim.arabic}
                    </div>
                  </div>
                  {scores[dim.id] > 0 && (
                    <span className="tag">{SCALE_LABELS[scores[dim.id]]}</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {OCS_SCALE.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setScore(dim.id, s.value)}
                      style={{
                        flex: 1,
                        padding: '10px 4px',
                        border: `1px solid ${scores[dim.id] === s.value ? 'var(--navy)' : 'var(--line)'}`,
                        borderRadius: 4,
                        background: scores[dim.id] === s.value ? 'var(--navy)' : 'var(--cream)',
                        color: scores[dim.id] === s.value ? 'var(--cream)' : 'var(--charcoal)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 15,
                        fontWeight: scores[dim.id] === s.value ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {s.value}
                    </button>
                  ))}
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 11, color: 'var(--mute)', marginTop: 6,
                  fontFamily: 'var(--font-body)',
                }}>
                  <span>Absent</span>
                  <span>Integrated</span>
                </div>
              </div>
            ))}
          </div>

          {allScored && (
            <div className="card" style={{ maxWidth: 640, marginTop: 28, background: 'var(--navy)', color: 'var(--cream)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, margin: '0 0 12px', color: 'var(--gold)' }}>
                Your check-in
              </h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {OCS_DIMENSIONS.map(d => (
                  <div key={d.id} style={{ textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
                      {scores[d.id]}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(245,238,217,0.7)' }}>{d.label}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: 'rgba(245,238,217,0.6)', marginTop: 16, marginBottom: 0 }}>
                Saving to your session record will be available in the next update.
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
