/**
 * PostSessionReflection — re-score OCS and name the one thing worth keeping.
 * kind: 'post-session'
 * result shape: { scores: { ocs_clarity, ocs_agency, ocs_groundedness, ocs_energy, ocs_momentum },
 *                 keeping: string }
 */
import { OCS_DIMENSIONS, OCS_SCALE } from '../../../lib/constants/frameworks'

const KEY_MAP = {
  clarity: 'ocs_clarity', agency: 'ocs_agency',
  groundedness: 'ocs_groundedness', energy: 'ocs_energy', momentum: 'ocs_momentum',
}
const EMPTY_SCORES = { ocs_clarity: 0, ocs_agency: 0, ocs_groundedness: 0, ocs_energy: 0, ocs_momentum: 0 }

export default function PostSessionReflection({ tool, result, onChange, onAddCommitment }) {
  const scores  = result?.scores  ?? EMPTY_SCORES
  const keeping = result?.keeping ?? ''

  function setScore(dimId, val) {
    const key = KEY_MAP[dimId]
    const next = { ...scores, [key]: scores[key] === val ? 0 : val }
    onChange({ scores: next, keeping })
  }

  function setKeeping(val) {
    onChange({ scores, keeping: val })
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 12 }}>
          Re-score OCS at close of session
        </div>
        {OCS_DIMENSIONS.map(dim => {
          const val = scores[KEY_MAP[dim.id]] ?? 0
          const label = val > 0 ? OCS_SCALE.find(s => s.value === val)?.label : ''
          return (
            <div key={dim.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy)' }}>
                  {dim.label} <span style={{ fontSize: 10, color: 'var(--mute)', fontStyle: 'italic' }}>{dim.arabic}</span>
                </span>
                {label && <span style={{ fontSize: 11, color: 'var(--gold)' }}>{label}</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    onClick={() => setScore(dim.id, v)}
                    style={{
                      flex: 1, padding: '7px 4px', fontSize: 14, cursor: 'pointer',
                      border: `1px solid ${val === v ? 'var(--navy)' : 'var(--line)'}`,
                      borderRadius: 4, fontFamily: 'var(--font-body)',
                      background: val === v ? 'var(--navy)' : 'var(--cream)',
                      color: val === v ? 'var(--cream)' : 'var(--charcoal)',
                      transition: 'all 0.12s',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
          {tool.prompts[0]}
        </label>
        <textarea
          style={{
            width: '100%', minHeight: 80, border: '1px solid var(--line)',
            borderRadius: 7, padding: '9px 12px', fontFamily: 'var(--font-body)',
            fontSize: 13, color: 'var(--charcoal)', background: 'var(--cream)', resize: 'vertical',
          }}
          value={keeping}
          onChange={e => setKeeping(e.target.value)}
          placeholder="One thing — a sentence is enough."
        />
      </div>

      {keeping.trim() && (
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={() => onAddCommitment(keeping.trim(), tool.name)}
            style={{
              fontSize: 11, fontWeight: 700, background: 'var(--navy)', color: 'var(--cream)',
              border: 'none', borderRadius: 5, padding: '5px 14px', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            → Add to Commitments
          </button>
        </div>
      )}
    </div>
  )
}
