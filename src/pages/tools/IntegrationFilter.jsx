/**
 * Integration Filter — sort experience: what have you learned vs. accumulated?
 * Gated tool: ProtectedRoute required.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import ShareWithMentor from '../../components/ShareWithMentor'
import { useToolSave } from '../../lib/useToolSave'

const FILTER_QUESTIONS = [
  {
    id: 'what',
    label: 'What was the experience?',
    placeholder: 'Describe it briefly — a role, event, season, relationship, or challenge.',
    type: 'text',
  },
  {
    id: 'learned',
    label: 'What did you genuinely learn from it?',
    placeholder: 'Something you now know, can do, or see differently because of it.',
    type: 'textarea',
  },
  {
    id: 'accumulated',
    label: 'What did you just accumulate?',
    placeholder: "Habits, assumptions, burdens, or patterns that came along but don't serve you.",
    type: 'textarea',
  },
  {
    id: 'carrying',
    label: 'What are you still carrying that belongs to that season — not this one?',
    placeholder: 'Roles, expectations, postures, or identities that made sense then but need re-examining now.',
    type: 'textarea',
  },
  {
    id: 'forward',
    label: 'What from this experience belongs in your next season?',
    placeholder: 'What do you consciously choose to bring forward?',
    type: 'textarea',
  },
]

const INITIAL_ENTRY = Object.fromEntries(FILTER_QUESTIONS.map(q => [q.id, '']))

export default function IntegrationFilter() {
  const { save, saving, saved, error, lastShared } = useToolSave('integration-filter')
  const [entries, setEntries] = useState([{ ...INITIAL_ENTRY, id: 1 }])
  const [nextId, setNextId] = useState(2)
  const [activeEntry, setActiveEntry] = useState(1)

  function addEntry() {
    const id = nextId
    setEntries(prev => [...prev, { ...INITIAL_ENTRY, id }])
    setNextId(n => n + 1)
    setActiveEntry(id)
  }

  function updateEntry(id, field, value) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  const current = entries.find(e => e.id === activeEntry) ?? entries[0]

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div className="journal-head">
            <div className="eyebrow">Integration Filter · Tool</div>
            <h1>What have you actually learned?</h1>
            <p className="pull">
              Not every experience teaches us something. Some just leave residue.
              The Integration Filter helps you sort what you&apos;ve genuinely integrated
              from what you&apos;re still carrying without meaning to.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', maxWidth: 760 }}>
            {/* Entry tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              {entries.map((e, idx) => (
                <button
                  key={e.id}
                  onClick={() => setActiveEntry(e.id)}
                  style={{
                    width: 44,
                    height: 44,
                    border: `1px solid ${activeEntry === e.id ? 'var(--navy)' : 'var(--line)'}`,
                    borderRadius: 4,
                    background: activeEntry === e.id ? 'var(--navy)' : 'var(--cream)',
                    color: activeEntry === e.id ? 'var(--cream)' : 'var(--charcoal)',
                    fontFamily: 'var(--font-display)',
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </button>
              ))}
              <button
                onClick={addEntry}
                style={{
                  width: 44,
                  height: 44,
                  border: '1px dashed var(--gold)',
                  borderRadius: 4,
                  background: 'none',
                  color: 'var(--gold)',
                  fontSize: 20,
                  cursor: 'pointer',
                }}
                aria-label="Add experience"
              >
                +
              </button>
            </div>

            {/* Active entry form */}
            <div className="card" style={{ flex: 1, padding: '24px 28px' }}>
              {FILTER_QUESTIONS.map(q => (
                <div key={q.id} className="form-group">
                  <label className="form-label">{q.label}</label>
                  {q.type === 'text' ? (
                    <input
                      className="form-input"
                      type="text"
                      value={current[q.id]}
                      onChange={e => updateEntry(activeEntry, q.id, e.target.value)}
                      placeholder={q.placeholder}
                    />
                  ) : (
                    <textarea
                      className="form-textarea"
                      value={current[q.id]}
                      onChange={e => updateEntry(activeEntry, q.id, e.target.value)}
                      placeholder={q.placeholder}
                      rows={3}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ maxWidth: 760, marginTop: 20, background: 'var(--off-white)' }}>
            <p style={{ fontSize: 14, color: 'var(--charcoal)', margin: 0, lineHeight: 1.7 }}>
              Work through each experience from the past year or two. Don&apos;t rush.
              The point isn&apos;t to produce a summary — it&apos;s to sit with each one long enough to
              distinguish learning from accumulation.
            </p>
          </div>

          <ShareWithMentor
            onShare={() => save({ entries })}
            saving={saving} saved={saved} error={error} lastShared={lastShared}
            hasContent={entries.some(e => e.what?.trim())}
          />

          <div style={{ marginTop: 20 }}>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back to dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
