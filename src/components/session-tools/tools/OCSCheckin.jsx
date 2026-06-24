/**
 * OCSCheckin — standalone OCS scorer inside the tools palette.
 * kind: 'ocs'
 * result shape: { ocs_clarity: 0, ocs_agency: 0, ocs_groundedness: 0, ocs_energy: 0, ocs_momentum: 0 }
 */
import { OCS_DIMENSIONS, OCS_SCALE } from '../../../lib/constants/frameworks'

const KEY_MAP = {
  clarity: 'ocs_clarity', agency: 'ocs_agency',
  groundedness: 'ocs_groundedness', energy: 'ocs_energy', momentum: 'ocs_momentum',
}

const EMPTY = { ocs_clarity: 0, ocs_agency: 0, ocs_groundedness: 0, ocs_energy: 0, ocs_momentum: 0 }

export default function OCSCheckin({ tool, result, onChange, onAddCommitment }) {
  const scores = result ?? EMPTY

  function setScore(dimId, val) {
    const key = KEY_MAP[dimId]
    onChange({ ...scores, [key]: scores[key] === val ? 0 : val })
  }

  const total = OCS_DIMENSIONS.reduce((t, d) => t + (scores[KEY_MAP[d.id]] ?? 0), 0)
  const lowestDim = OCS_DIMENSIONS.reduce((low, d) => {
    const v = scores[KEY_MAP[d.id]] ?? 0
    return (v > 0 && v < (scores[KEY_MAP[low.id]] || 6)) ? d : low
  }, OCS_DIMENSIONS[0])

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>

      {OCS_DIMENSIONS.map(dim => {
        const val = scores[KEY_MAP[dim.id]] ?? 0
        const label = val > 0 ? OCS_SCALE.find(s => s.value === val)?.label : ''
        return (
          <div key={dim.id} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--navy)' }}>
                {dim.label} <span style={{ fontSize: 11, color: 'var(--mute)', fontStyle: 'italic' }}>{dim.arabic}</span>
              </span>
              {label && <span style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.08em' }}>{label}</span>}
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

      {total > 0 && (
        <div style={{
          padding: '10px 14px', background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, marginTop: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#7a6020' }}>
            Total: {total}/25 · Lowest: {lowestDim.label}
          </span>
          <button
            onClick={() => onAddCommitment(`Focus on ${lowestDim.label} (${lowestDim.arabic}) — currently ${scores[KEY_MAP[lowestDim.id]]}/5`, tool.name)}
            style={{
              fontSize: 11, fontWeight: 700, background: 'var(--navy)', color: 'var(--cream)',
              border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer',
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
