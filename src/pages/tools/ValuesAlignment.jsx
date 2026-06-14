/**
 * Values-to-Actions Alignment — Tool 07
 *
 * A short audit for testing whether daily actions match stated values.
 * Useful when something feels out of alignment, but is hard to name.
 * Keep it practical and non-shaming — grounded in the actual week.
 *
 * ProtectedRoute required.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import ShareWithMentor from '../../components/ShareWithMentor'
import { useToolSave } from '../../lib/useToolSave'

const REFLECTION_QUESTIONS = [
  'Where did your actions align with your values this week — even briefly?',
  'Where did they drift? What was driving the drift?',
  'What would one more aligned action look like next week — small and specific?',
]

const EMPTY_VALUE = { name: '', visible: '', notes: '' }

export default function ValuesAlignment() {
  const { save, saving, saved, error, lastShared } = useToolSave('values-alignment')
  const [values, setValues] = useState([
    { ...EMPTY_VALUE },
    { ...EMPTY_VALUE },
    { ...EMPTY_VALUE },
  ])
  const [reflections, setReflections] = useState({})

  function updateValue(i, field, val) {
    setValues(vs => vs.map((v, idx) => idx === i ? { ...v, [field]: val } : v))
  }

  function addValue() {
    if (values.length < 8) setValues(vs => [...vs, { ...EMPTY_VALUE }])
  }

  function setReflection(i, val) { setReflections(r => ({ ...r, [i]: val })) }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">

          <div className="journal-head">
            <div className="eyebrow">Tool 07 · Alignment</div>
            <h1>Values-to-Actions Alignment</h1>
            <p className="pull">
              A short audit for testing whether your daily actions match your stated values.
              We are not looking for perfection. We are looking for honesty about the gap —
              and what one faithful step toward alignment would look like.
            </p>
          </div>

          {/* Values list */}
          <div style={{ maxWidth: 680, marginBottom: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              List values that matter to you, then examine whether they are visible in your life this week.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Header row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px 1fr',
                gap: 12, padding: '0 4px',
                fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--mute)', fontFamily: 'var(--font-body)',
              }}>
                <span>Value</span>
                <span>Visible this week?</span>
                <span>Evidence / notes</span>
              </div>

              {values.map((v, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 140px 1fr',
                  gap: 12, alignItems: 'start',
                  background: 'var(--off-white)', border: '1px solid var(--line)',
                  borderRadius: 4, padding: '14px 16px',
                }}>
                  <input
                    type="text"
                    value={v.name}
                    onChange={e => updateValue(i, 'name', e.target.value)}
                    placeholder={`Value ${i + 1}`}
                    style={{
                      fontFamily: 'var(--font-body)', fontSize: 14, width: '100%',
                      border: '1px solid var(--line)', borderRadius: 4,
                      padding: '8px 10px', background: 'var(--cream)',
                      color: 'var(--charcoal)', outline: 'none',
                    }}
                  />
                  <select
                    value={v.visible}
                    onChange={e => updateValue(i, 'visible', e.target.value)}
                    style={{
                      fontFamily: 'var(--font-body)', fontSize: 14, width: '100%',
                      border: '1px solid var(--line)', borderRadius: 4,
                      padding: '8px 10px', background: 'var(--cream)',
                      color: v.visible ? 'var(--charcoal)' : 'var(--mute)', outline: 'none',
                    }}
                  >
                    <option value="">—</option>
                    <option value="yes">Yes — clearly</option>
                    <option value="partial">Partially</option>
                    <option value="no">Not this week</option>
                  </select>
                  <input
                    type="text"
                    value={v.notes}
                    onChange={e => updateValue(i, 'notes', e.target.value)}
                    placeholder="Brief note"
                    style={{
                      fontFamily: 'var(--font-body)', fontSize: 14, width: '100%',
                      border: '1px solid var(--line)', borderRadius: 4,
                      padding: '8px 10px', background: 'var(--cream)',
                      color: 'var(--charcoal)', outline: 'none',
                    }}
                  />
                </div>
              ))}

              {values.length < 8 && (
                <button
                  onClick={addValue}
                  className="btn btn-ghost btn-sm"
                  style={{ alignSelf: 'flex-start' }}
                >
                  + Add value
                </button>
              )}
            </div>
          </div>

          {/* Reflection questions */}
          <div style={{ maxWidth: 640 }}>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Reflection Questions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {REFLECTION_QUESTIONS.map((q, i) => (
                <div key={i} className="card" style={{ padding: '20px 24px' }}>
                  <label style={{
                    display: 'block',
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 16, color: 'var(--navy)', lineHeight: 1.5, marginBottom: 12,
                  }}>
                    {q}
                  </label>
                  <textarea
                    value={reflections[i] ?? ''}
                    onChange={e => setReflection(i, e.target.value)}
                    rows={3}
                    placeholder="Write honestly."
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      fontFamily: 'var(--font-body)', fontSize: 15,
                      lineHeight: 1.7, resize: 'vertical',
                      border: '1px solid var(--line)', borderRadius: 4,
                      padding: '12px 14px', background: 'var(--off-white)',
                      color: 'var(--charcoal)', outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <ShareWithMentor
            onShare={() => save({ values, reflections })}
            saving={saving} saved={saved} error={error} lastShared={lastShared}
            hasContent={values.some(v => v.name.trim())}
          />

          <div style={{ marginTop: 20 }}>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back to dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
