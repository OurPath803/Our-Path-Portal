/**
 * Position Map — four-dimension personal position tool
 * Dimensions: Clarity, Commitment, Capacity, Context
 * Gated tool: ProtectedRoute required.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { POSITION_MAP_DIMENSIONS } from '../../lib/constants/frameworks'

const DIMENSION_DESCRIPTIONS = {
  Clarity:    'How clearly do you see where you are and where you want to go?',
  Commitment: "How committed are you to the direction you've identified?",
  Capacity:   'Do you have the time, energy, and resources to act?',
  Context:    'Are the conditions around you enabling or restricting movement?',
}

export default function PositionMap() {
  const [scores, setScores] = useState(
    Object.fromEntries(POSITION_MAP_DIMENSIONS.map(d => [d, 0]))
  )

  const allScored = POSITION_MAP_DIMENSIONS.every(d => scores[d] > 0)

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div className="journal-head">
            <div className="eyebrow">Position Map · Tool</div>
            <h1>Where do you stand?</h1>
            <p className="pull">
              Rate yourself honestly on each dimension from 1 (low) to 5 (high).
              This snapshot reveals where to focus your development energy.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
            {POSITION_MAP_DIMENSIONS.map(dim => (
              <div key={dim} className="card" style={{ padding: '24px 28px' }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  color: 'var(--navy)',
                  margin: '0 0 6px',
                }}>
                  {dim}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--mute)', margin: '0 0 16px', lineHeight: 1.5 }}>
                  {DIMENSION_DESCRIPTIONS[dim]}
                </p>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <button
                      key={v}
                      onClick={() => setScores(s => ({ ...s, [dim]: v }))}
                      style={{
                        flex: 1,
                        aspectRatio: '1',
                        border: `1px solid ${scores[dim] === v ? 'var(--gold)' : 'var(--line)'}`,
                        borderRadius: 4,
                        background: scores[dim] === v ? 'var(--gold)' : 'var(--cream)',
                        color: scores[dim] === v ? 'var(--navy)' : 'var(--charcoal)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {v}
                    </button>
                  ))}
                  {scores[dim] > 0 && (
                    <span style={{ fontSize: 13, color: 'var(--mute)', whiteSpace: 'nowrap', paddingLeft: 8 }}>
                      {scores[dim]} / 5
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {allScored && (
            <div className="card" style={{ maxWidth: 640, marginTop: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, margin: '0 0 16px', color: 'var(--navy)' }}>
                Your position
              </h3>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {POSITION_MAP_DIMENSIONS.map(d => {
                  const pct = (scores[d] / 5) * 100
                  return (
                    <div key={d} style={{ flex: '1 0 120px' }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: 13, marginBottom: 6,
                      }}>
                        <span style={{ color: 'var(--charcoal)' }}>{d}</span>
                        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{scores[d]}</span>
                      </div>
                      <div style={{
                        height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: 'var(--gold)', borderRadius: 3,
                          transition: 'width 0.3s',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <p style={{ fontSize: 13, color: 'var(--mute)', marginTop: 16, marginBottom: 0 }}>
                Bring this to your next session. Your mentor will use it alongside the OCS check-in.
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
