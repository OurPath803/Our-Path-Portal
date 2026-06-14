/**
 * Orientation Framework — choose direction from clarity
 * Structured reflection leading to an Orientation Statement.
 * Gated tool: ProtectedRoute required.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import ShareWithMentor from '../../components/ShareWithMentor'
import { useToolSave } from '../../lib/useToolSave'
import { AL_MASIR_PHASES } from '../../lib/constants/frameworks'

const ORIENTATION_QUESTIONS = [
  {
    id: 'season',
    label: 'What season of life are you in right now?',
    placeholder: 'Describe it without judgement — what characterises this period?',
  },
  {
    id: 'requires',
    label: 'What does this season require of you?',
    placeholder: 'Not what you want it to require — what is it actually asking?',
  },
  {
    id: 'moving_toward',
    label: 'What are you moving toward?',
    placeholder: "Name it simply, even if it's incomplete.",
  },
  {
    id: 'moving_away',
    label: 'What are you moving away from?',
    placeholder: 'Patterns, postures, or situations you are choosing to leave behind.',
  },
  {
    id: 'faithful_next',
    label: 'What is the next faithful step?',
    placeholder: "Not the whole plan — just what's next. The one that feels honest.",
  },
]

export default function OrientationFramework() {
  const { save, saving, saved, error, lastShared } = useToolSave('orientation')
  const [form, setForm] = useState(
    Object.fromEntries(ORIENTATION_QUESTIONS.map(q => [q.id, '']))
  )
  const [currentPhase, setCurrentPhase] = useState('')

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  const allFilled = ORIENTATION_QUESTIONS.every(q => form[q.id].trim().length > 0)

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div className="journal-head">
            <div className="eyebrow">Orientation Framework · Tool</div>
            <h1>Choose your direction deliberately.</h1>
            <p className="pull">
              This tool is the culmination of the OurPath process. After seeing where you
              are, naming the cost, and sorting your experience — you choose your orientation.
            </p>
          </div>

          {/* Phase selector */}
          <div className="card" style={{ maxWidth: 680, marginBottom: 28 }}>
            <div style={{ fontSize: 13, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
              Where are you on the Pathway — al-Masir?
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {AL_MASIR_PHASES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setCurrentPhase(p.id)}
                  style={{
                    padding: '8px 16px',
                    border: currentPhase === p.id ? '1px solid var(--navy)' : '1px solid var(--line)',
                    borderRadius: 20,
                    background: currentPhase === p.id ? 'var(--navy)' : 'var(--cream)',
                    color: currentPhase === p.id ? 'var(--cream)' : 'var(--charcoal)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {p.label}
                  <span style={{
                    display: 'block',
                    fontSize: 11,
                    color: currentPhase === p.id ? 'rgba(245,238,217,0.6)' : 'var(--mute)',
                    marginTop: 2,
                  }}>
                    {p.arabic}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Orientation questions */}
          <div className="card" style={{ maxWidth: 680, padding: '28px 32px' }}>
            <div style={{ fontSize: 13, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              Five orientation questions
            </div>
            {ORIENTATION_QUESTIONS.map((q, idx) => (
              <div key={q.id} className="form-group">
                <label className="form-label">
                  <span style={{ color: 'var(--gold)', marginRight: 8 }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {q.label}
                </label>
                <textarea
                  className="form-textarea"
                  value={form[q.id]}
                  onChange={e => update(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  rows={3}
                />
              </div>
            ))}
          </div>

          {/* Orientation Statement preview */}
          {allFilled && (
            <div className="card" style={{ maxWidth: 680, marginTop: 24, background: 'var(--navy)', color: 'var(--cream)' }}>
              <div style={{ fontSize: 13, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                Your Orientation Statement
              </div>
              <blockquote style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                lineHeight: 1.7,
                color: 'var(--cream)',
                borderLeft: '2px solid var(--gold)',
                paddingLeft: 20,
                margin: 0,
              }}>
                I am in a season of {form.season.toLowerCase()}.
                It requires {form.requires.toLowerCase()}.
                I am moving toward {form.moving_toward.toLowerCase()},
                and moving away from {form.moving_away.toLowerCase()}.
                My next faithful step is {form.faithful_next.toLowerCase()}.
              </blockquote>
            </div>
          )}

          <ShareWithMentor
            onShare={() => save({ currentPhase, ...form })}
            saving={saving} saved={saved} error={error} lastShared={lastShared}
            hasContent={Object.values(form).some(v => v?.trim())}
          />

          <div style={{ marginTop: 20 }}>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">Back to dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
