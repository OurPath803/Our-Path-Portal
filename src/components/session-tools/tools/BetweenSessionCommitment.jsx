/**
 * BetweenSessionCommitment — a direct commitment builder.
 * Typing here and clicking Add immediately pushes to the Commitments panel.
 * kind: 'commitment'
 * No persistent result needed — commitment lives in the commitments table.
 */
import { useState } from 'react'

export default function BetweenSessionCommitment({ tool, onAddCommitment }) {
  const [text, setText] = useState('')

  function add() {
    if (!text.trim()) return
    onAddCommitment(text.trim(), tool.name)
    setText('')
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="What will they do before the next session?"
          style={{
            flex: 1, border: '1px solid var(--line)', borderRadius: 7,
            padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13,
            background: 'var(--cream)', color: 'var(--charcoal)',
          }}
        />
        <button
          onClick={add}
          disabled={!text.trim()}
          style={{
            background: 'var(--navy)', color: 'var(--cream)', border: 'none',
            borderRadius: 7, padding: '9px 16px', fontWeight: 700, fontSize: 12,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Add to Commitments
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--mute)', marginTop: 8, fontStyle: 'italic' }}>
        Commitments appear in the panel below. They are visible to the mentee.
      </p>
    </div>
  )
}
