/**
 * DecisionDiscernment — test a live decision against 6 pass/fail questions.
 * kind: 'checklist'
 * result shape: { decision: string, answers: boolean[] (length 6) }
 */
import { SESSION_TOOLS } from '../../../lib/constants/frameworks'

export default function DecisionDiscernment({ tool, result, onChange, onAddCommitment }) {
  const decision = result?.decision ?? ''
  const answers  = result?.answers  ?? Array(tool.checks.length).fill(null)

  function setDecision(val) {
    onChange({ decision: val, answers })
  }

  function setAnswer(idx, val) {
    const next = [...answers]
    next[idx] = next[idx] === val ? null : val
    onChange({ decision, answers: next })
  }

  const failCount = answers.filter(a => a === false).length
  const allAnswered = answers.every(a => a !== null)

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
          Decision being tested
        </label>
        <input
          type="text"
          value={decision}
          onChange={e => setDecision(e.target.value)}
          placeholder="Name the decision clearly…"
          style={{
            width: '100%', border: '1px solid var(--line)', borderRadius: 7,
            padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13,
            background: 'var(--cream)', color: 'var(--charcoal)',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {tool.checks.map((check, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', background: 'var(--cream)',
            border: '1px solid var(--line)', borderRadius: 7,
          }}>
            <span style={{ flex: 1, fontSize: 13, color: 'var(--charcoal)' }}>{check}</span>
            <div style={{ display: 'flex', gap: 5 }}>
              {[
                { val: true,  label: '✓ Yes', onStyle: { background: 'rgba(46,125,94,0.15)', color: '#2e7d5e', borderColor: 'rgba(46,125,94,0.4)' } },
                { val: false, label: '✗ No',  onStyle: { background: 'rgba(192,57,43,0.12)', color: '#c0392b', borderColor: 'rgba(192,57,43,0.35)' } },
              ].map(opt => (
                <button
                  key={String(opt.val)}
                  onClick={() => setAnswer(idx, opt.val)}
                  style={{
                    padding: '4px 11px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    border: '1px solid var(--line)', borderRadius: 5, fontFamily: 'var(--font-body)',
                    background: 'var(--off-white)', color: 'var(--mute)',
                    ...(answers[idx] === opt.val ? opt.onStyle : {}),
                    transition: 'all 0.1s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allAnswered && (
        <div style={{
          padding: '10px 14px',
          background: failCount >= 2 ? 'rgba(192,57,43,0.08)' : 'rgba(46,125,94,0.08)',
          border: `1px solid ${failCount >= 2 ? 'rgba(192,57,43,0.3)' : 'rgba(46,125,94,0.3)'}`,
          borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: failCount >= 2 ? '#c0392b' : '#2e7d5e', fontWeight: 600 }}>
            {failCount === 0
              ? 'All checks passed — proceed with intention.'
              : failCount === 1
              ? '1 check failed — worth sitting with.'
              : `${failCount} checks failed — this decision needs redesign, not willpower.`}
          </span>
          {decision.trim() && (
            <button
              onClick={() => onAddCommitment(
                failCount >= 2
                  ? `Redesign decision: "${decision}" — ${failCount} checks failed`
                  : `Carry forward: "${decision}" — passed discernment`,
                tool.name
              )}
              style={{
                fontSize: 11, fontWeight: 700, background: 'var(--navy)', color: 'var(--cream)',
                border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer',
                fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', marginLeft: 10,
              }}
            >
              → Add to Commitments
            </button>
          )}
        </div>
      )}
    </div>
  )
}
