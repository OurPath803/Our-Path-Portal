/**
 * JournalPromptTool — shared renderer for all journal-prompt tools.
 *
 * Props:
 *   tool        — SESSION_TOOLS entry (has .name, .arabic, .arabicEn, .prompts, .description)
 *   result      — { answers: { [prompt]: string } } from session.tool_results[tool.id]
 *   onChange    — fn(newResult) called on every keystroke; parent batches to DB
 *   onAddCommitment — fn(text, toolName) push an answer as a commitment
 */
import { useState } from 'react'

export default function JournalPromptTool({ tool, result, onChange, onAddCommitment }) {
  const answers = result?.answers ?? {}

  function setAnswer(prompt, value) {
    onChange({ answers: { ...answers, [prompt]: value } })
  }

  return (
    <div>
      <p style={{
        fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6,
        marginBottom: 18,
      }}>
        {tool.description}
      </p>

      {tool.prompts.map(prompt => (
        <div key={prompt} style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)',
            marginBottom: 6, lineHeight: 1.4,
          }}>
            {prompt}
          </label>
          <textarea
            style={{
              width: '100%', minHeight: 80, border: '1px solid var(--line)',
              borderRadius: 7, padding: '9px 12px',
              fontFamily: 'var(--font-body)', fontSize: 13,
              color: 'var(--charcoal)', background: 'var(--cream)', resize: 'vertical',
            }}
            value={answers[prompt] ?? ''}
            onChange={e => setAnswer(prompt, e.target.value)}
            placeholder="Write here…"
          />
          {(answers[prompt] ?? '').trim().length > 0 && (
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <button
                onClick={() => onAddCommitment(answers[prompt].trim(), tool.name)}
                style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--navy)',
                  background: 'transparent', border: '1px solid var(--line)',
                  borderRadius: 5, padding: '3px 10px', cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                → Add to Commitments
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
