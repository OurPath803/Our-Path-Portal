/**
 * ProgressReview — read-only OCS trend across past check-ins.
 * kind: 'review'
 * No result saved — purely derived from checkinHistory.
 *
 * checkinHistory: array of { created_at, ocs_clarity, ocs_agency, ocs_groundedness, ocs_energy, ocs_momentum }
 */
import { OCS_DIMENSIONS, OCS_SCALE } from '../../../lib/constants/frameworks'

const KEY_MAP = {
  clarity: 'ocs_clarity', agency: 'ocs_agency',
  groundedness: 'ocs_groundedness', energy: 'ocs_energy', momentum: 'ocs_momentum',
}

function total(row) {
  return OCS_DIMENSIONS.reduce((t, d) => t + (row[KEY_MAP[d.id]] ?? 0), 0)
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function ProgressReview({ tool, checkinHistory = [] }) {
  if (checkinHistory.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'var(--mute)', fontStyle: 'italic' }}>
        No check-in history yet for this mentee.
      </p>
    )
  }

  const last = checkinHistory[checkinHistory.length - 1]
  const prev = checkinHistory.length >= 2 ? checkinHistory[checkinHistory.length - 2] : null
  const delta = prev ? total(last) - total(prev) : null

  let lowDim = OCS_DIMENSIONS[0]
  OCS_DIMENSIONS.forEach(d => {
    if ((last[KEY_MAP[d.id]] ?? 0) < (last[KEY_MAP[lowDim.id]] ?? 0)) lowDim = d
  })
  const lowVal = last[KEY_MAP[lowDim.id]] ?? 0
  const lowLabel = OCS_SCALE.find(s => s.value === lowVal)?.label ?? '—'

  const last3 = checkinHistory.slice(-3).map(total)
  const plateau = last3.length === 3 && Math.max(...last3) - Math.min(...last3) <= 1

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 8, padding: '12px 16px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 4 }}>Latest total</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--navy)' }}>{total(last)}<span style={{ fontSize: 13 }}>/25</span></div>
          <div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 2 }}>{fmtDate(last.created_at)}</div>
        </div>
        {delta !== null && (
          <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 8, padding: '12px 16px', flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 4 }}>Change</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: delta >= 0 ? '#27AE60' : '#C0392B' }}>
              {delta >= 0 ? '+' : ''}{delta}
            </div>
            <div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 2 }}>since previous</div>
          </div>
        )}
        <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 8, padding: '12px 16px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 4 }}>Lowest dimension</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{lowDim.label}</div>
          <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 2 }}>{lowVal}/5 — {lowLabel}</div>
        </div>
      </div>

      {OCS_DIMENSIONS.map(dim => {
        const val = last[KEY_MAP[dim.id]] ?? 0
        const prevVal = prev ? (prev[KEY_MAP[dim.id]] ?? 0) : null
        return (
          <div key={dim.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
                {dim.label} <span style={{ fontSize: 10, color: 'var(--mute)', fontStyle: 'italic' }}>{dim.arabic}</span>
              </span>
              <span style={{ color: 'var(--mute)' }}>
                {val}/5
                {prevVal !== null && prevVal !== val && (
                  <span style={{ color: val > prevVal ? '#27AE60' : '#C0392B', marginLeft: 6 }}>
                    {val > prevVal ? '↑' : '↓'}
                  </span>
                )}
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(val / 5) * 100}%`, background: 'var(--gold)', borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
          </div>
        )
      })}

      {plateau && (
        <div style={{
          marginTop: 16, padding: '10px 14px',
          background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 8, fontSize: 12, color: '#7a6020',
        }}>
          ⚠ Plateau across three check-ins — possible ceiling in current structure. Consider the Energy &amp; Capacity audit.
        </div>
      )}
      {delta !== null && delta <= -4 && (
        <div style={{
          marginTop: 16, padding: '10px 14px',
          background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)',
          borderRadius: 8, fontSize: 12, color: '#c0392b',
        }}>
          ⚠ Sharp drop since last check-in — prioritise the person over the plan.
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--mute)', marginTop: 14, fontStyle: 'italic' }}>
        {checkinHistory.length} check-in{checkinHistory.length !== 1 ? 's' : ''} recorded.
      </p>
    </div>
  )
}
