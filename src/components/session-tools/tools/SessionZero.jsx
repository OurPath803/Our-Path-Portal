/**
 * SessionZero — structured intake form used in the first session.
 * Captures presenting context, readiness level, and fitra baseline note.
 * kind: 'session-zero'
 */
export default function SessionZero({ tool, result, onChange, onAddCommitment }) {
  const data = result ?? { presenting: '', readiness: '', fitra: '' }

  function update(key, val) {
    onChange({ ...data, [key]: val })
  }

  const fields = [
    { key: 'presenting', label: 'Presenting context', placeholder: 'What brought them here? What are they naming as the problem or desire?' },
    { key: 'readiness',  label: 'Readiness for change', placeholder: 'How ready do they seem — and what might be getting in the way?' },
    { key: 'fitra',      label: 'Fitra baseline note', placeholder: 'What feels original and healthy in them — before the presenting layer?' },
  ]

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>
      {fields.map(f => (
        <div key={f.key} style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
            {f.label}
          </label>
          <textarea
            style={{
              width: '100%', minHeight: 80, border: '1px solid var(--line)',
              borderRadius: 7, padding: '9px 12px', fontFamily: 'var(--font-body)',
              fontSize: 13, color: 'var(--charcoal)', background: 'var(--cream)', resize: 'vertical',
            }}
            value={data[f.key]}
            onChange={e => update(f.key, e.target.value)}
            placeholder={f.placeholder}
          />
        </div>
      ))}
      {(data.presenting || data.readiness || data.fitra) && (
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={() => onAddCommitment(`Session Zero noted: ${data.presenting.slice(0, 80)}`, tool.name)}
            style={{
              fontSize: 11, fontWeight: 700, color: 'var(--navy)',
              background: 'transparent', border: '1px solid var(--line)',
              borderRadius: 5, padding: '4px 12px', cursor: 'pointer',
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
