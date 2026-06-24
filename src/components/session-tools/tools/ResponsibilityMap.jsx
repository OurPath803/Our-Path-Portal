/**
 * ResponsibilityMap — sort concerns into Mine / Shared / Not mine.
 * kind: 'buckets'
 * result shape: { items: [{ text: string, bucket: 'mine'|'shared'|'not_mine' }] }
 */
import { useState } from 'react'

const BUCKETS = [
  { id: 'mine',     label: 'Mine',     hint: 'Act fully on these.' },
  { id: 'shared',   label: 'Shared',   hint: 'Negotiate — not yours alone to carry.' },
  { id: 'not_mine', label: 'Not mine', hint: 'Release with tawakkul.' },
]

export default function ResponsibilityMap({ tool, result, onChange, onAddCommitment }) {
  const [input, setInput] = useState('')
  const [bucket, setBucket] = useState('mine')

  const items = result?.items ?? []

  function addItem() {
    if (!input.trim()) return
    onChange({ items: [...items, { text: input.trim(), bucket }] })
    setInput('')
  }

  function removeItem(idx) {
    onChange({ items: items.filter((_, i) => i !== idx) })
  }

  const mineItems = items.filter(i => i.bucket === 'mine')

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
          placeholder="Add something to sort…"
          style={{
            flex: 1, border: '1px solid var(--line)', borderRadius: 7,
            padding: '8px 12px', fontFamily: 'var(--font-body)', fontSize: 13,
            background: 'var(--cream)', color: 'var(--charcoal)',
          }}
        />
        <select
          value={bucket}
          onChange={e => setBucket(e.target.value)}
          style={{
            border: '1px solid var(--line)', borderRadius: 7, padding: '8px 10px',
            fontFamily: 'var(--font-body)', fontSize: 12, background: 'var(--cream)',
            color: 'var(--charcoal)',
          }}
        >
          {BUCKETS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
        <button
          onClick={addItem}
          disabled={!input.trim()}
          style={{
            background: 'var(--navy)', color: 'var(--cream)', border: 'none',
            borderRadius: 7, padding: '8px 14px', fontWeight: 700, fontSize: 12,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Add
        </button>
      </div>

      {/* Buckets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        {BUCKETS.map(b => (
          <div key={b.id} style={{
            border: '1.5px dashed var(--line)', borderRadius: 8, padding: 10, minHeight: 80,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 6, textAlign: 'center',
            }}>
              {b.label}
            </div>
            <div style={{ fontSize: 10, color: 'var(--mute)', fontStyle: 'italic', marginBottom: 8, textAlign: 'center' }}>
              {b.hint}
            </div>
            {items.filter(i => i.bucket === b.id).map((item, idx) => {
              const globalIdx = items.indexOf(item)
              return (
                <div key={idx} style={{
                  background: 'var(--cream)', border: '1px solid var(--line)',
                  borderRadius: 5, padding: '4px 8px', fontSize: 11, marginBottom: 4,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4,
                }}>
                  <span>{item.text}</span>
                  <button
                    onClick={() => removeItem(globalIdx)}
                    style={{ fontSize: 10, color: 'var(--mute)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {mineItems.length > 0 && (
        <div style={{
          padding: '10px 14px', background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#7a6020' }}>
            {mineItems.length} item{mineItems.length > 1 ? 's' : ''} in Mine → add as commitment?
          </span>
          <button
            onClick={() => mineItems.forEach(i => onAddCommitment(i.text, tool.name))}
            style={{
              fontSize: 11, fontWeight: 700, background: 'var(--navy)', color: 'var(--cream)',
              border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            → Add all Mine to Commitments
          </button>
        </div>
      )}
    </div>
  )
}
