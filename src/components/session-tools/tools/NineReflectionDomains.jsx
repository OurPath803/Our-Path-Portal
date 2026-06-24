/**
 * NineReflectionDomains — rate the mentee's current engagement across all 9 domains (1–3).
 * kind: 'domains'
 * result shape: { ratings: { [domainName]: 1|2|3 } }
 *
 * Distinct from domains_explored in the Framework panel — this is a life-territory assessment,
 * not a record of what was discussed in session.
 */
import { REFLECTION_DOMAINS } from '../../../lib/constants/frameworks'

const RATING_LABELS = { 1: 'Neglected', 2: 'Some attention', 3: 'Active' }

export default function NineReflectionDomains({ tool, result, onChange, onAddCommitment }) {
  const ratings = result?.ratings ?? {}

  function setRating(domain, val) {
    const current = ratings[domain]
    onChange({ ratings: { ...ratings, [domain]: current === val ? 0 : val } })
  }

  const neglected = REFLECTION_DOMAINS.filter(d => !ratings[d] || ratings[d] === 1)

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>

      {REFLECTION_DOMAINS.map(domain => {
        const val = ratings[domain] ?? 0
        return (
          <div key={domain} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 12px', background: 'var(--cream)', border: '1px solid var(--line)',
            borderRadius: 7, marginBottom: 6,
          }}>
            <span style={{ fontSize: 13, color: 'var(--charcoal)' }}>{domain}</span>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {val > 0 && (
                <span style={{ fontSize: 10, color: 'var(--mute)', marginRight: 4 }}>
                  {RATING_LABELS[val]}
                </span>
              )}
              {[1, 2, 3].map(v => (
                <button
                  key={v}
                  onClick={() => setRating(domain, v)}
                  title={RATING_LABELS[v]}
                  style={{
                    width: 28, height: 28, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    border: `1px solid ${val === v ? 'var(--navy)' : 'var(--line)'}`,
                    borderRadius: 5, fontFamily: 'var(--font-body)',
                    background: val === v ? 'var(--navy)' : 'var(--off-white)',
                    color: val === v ? 'var(--cream)' : 'var(--mute)',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {neglected.length > 0 && Object.keys(ratings).length > 0 && (
        <div style={{
          padding: '10px 14px', background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, marginTop: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#7a6020' }}>
            Neglected territories: {neglected.slice(0, 2).join(', ')}{neglected.length > 2 ? ` + ${neglected.length - 2} more` : ''}
          </span>
          <button
            onClick={() => onAddCommitment(`Bring attention to: ${neglected[0]}`, tool.name)}
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
