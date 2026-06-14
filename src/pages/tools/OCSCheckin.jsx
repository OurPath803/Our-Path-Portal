/**
 * OCS Check-In — three-tab tool covering the full session arc.
 *
 * Tabs:
 *   1. Pre-Session  — arriving check-in (3 reflective questions)
 *   2. OCS Check-In — OurPath Check-In Scale (5 dimensions, scored 1–5)
 *   3. Post-Session — leaving check-in (2 reflective questions)
 *
 * All behind ProtectedRoute. Local state only — Supabase persistence
 * will be wired in the next data pass.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import ShareWithMentor from '../../components/ShareWithMentor'
import { useToolSave } from '../../lib/useToolSave'
import { OCS_DIMENSIONS, OCS_SCALE } from '../../lib/constants/frameworks'

const SCALE_LABELS = {
  1: 'Absent',
  2: 'Flickering',
  3: 'Present but fragile',
  4: 'Stable',
  5: 'Integrated',
}

const PRE_QUESTIONS = [
  { id: 'alive',    label: "What's most alive in me today?" },
  { id: 'leaving',  label: "What I'd like to leave this session with." },
  { id: 'offlimits', label: "Anything off-limits today, or that needs handling gently." },
]

const POST_QUESTIONS = [
  { id: 'landed',   label: "What landed today." },
  { id: 'different', label: "What's different now from when I arrived." },
]

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        fontSize: 13,
        fontFamily: 'var(--font-body)',
        background: 'transparent',
        color: active ? 'var(--navy)' : 'var(--mute)',
        borderBottom: `2px solid ${active ? 'var(--navy)' : 'transparent'}`,
        marginBottom: -1,
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >
      {children}
    </button>
  )
}

function ReflectiveQuestions({ questions, values, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      {questions.map(q => (
        <div key={q.id} className="card" style={{ padding: '24px 28px' }}>
          <label style={{
            display: 'block',
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            color: 'var(--navy)',
            marginBottom: 12,
            fontStyle: 'italic',
            lineHeight: 1.4,
          }}>
            {q.label}
          </label>
          <textarea
            value={values[q.id] ?? ''}
            onChange={e => onChange(q.id, e.target.value)}
            rows={4}
            placeholder="Write honestly — there are no right answers."
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
  )
}

export default function OCSCheckin() {
  const { save, saving, saved, error, lastShared } = useToolSave('ocs-checkin')
  const [tab, setTab] = useState('ocs')

  // Pre-session state
  const [preAnswers, setPreAnswers] = useState({})
  function setPreAnswer(id, val) { setPreAnswers(a => ({ ...a, [id]: val })) }

  // OCS state
  const [scores, setScores] = useState(
    Object.fromEntries(OCS_DIMENSIONS.map(d => [d.id, 0]))
  )
  function setScore(id, val) { setScores(s => ({ ...s, [id]: val })) }
  const allScored = OCS_DIMENSIONS.every(d => scores[d.id] > 0)

  // Post-session state
  const [postAnswers, setPostAnswers] = useState({})
  function setPostAnswer(id, val) { setPostAnswers(a => ({ ...a, [id]: val })) }

  const hasContent = allScored || Object.values(preAnswers).some(v => v?.trim()) || Object.values(postAnswers).some(v => v?.trim())
  function handleShare() { save({ pre: preAnswers, scores, post: postAnswers }) }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">

          <div className="journal-head">
            <div className="eyebrow">OurPath Check-In Scale · OCS</div>
            <h1>Check-in</h1>
            <p className="pull">
              Three moments in the arc of a session: arriving, scoring, leaving.
            </p>
          </div>

          {/* Tab bar */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--line)',
            marginBottom: 32, gap: 0,
          }}>
            <TabBtn active={tab === 'pre'} onClick={() => setTab('pre')}>Pre-session</TabBtn>
            <TabBtn active={tab === 'ocs'} onClick={() => setTab('ocs')}>OCS Check-In</TabBtn>
            <TabBtn active={tab === 'post'} onClick={() => setTab('post')}>Post-session</TabBtn>
          </div>

          {/* Pre-session */}
          {tab === 'pre' && (
            <>
              <div style={{ maxWidth: 560, marginBottom: 28 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
                  Arriving — body and mind, right now. There's no right answer here. The point is only to notice.
                </p>
              </div>
              <ReflectiveQuestions
                questions={PRE_QUESTIONS}
                values={preAnswers}
                onChange={setPreAnswer}
              />
            </>
          )}

          {/* OCS */}
          {tab === 'ocs' && (
            <>
              <div style={{ maxWidth: 560, marginBottom: 28 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
                  Rate each dimension honestly — this is a snapshot, not an assessment.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 640 }}>
                {OCS_DIMENSIONS.map(dim => (
                  <div key={dim.id} className="card" style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--navy)', margin: 0 }}>
                          {dim.label}
                        </h3>
                        <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 2 }}>{dim.arabic}</div>
                      </div>
                      {scores[dim.id] > 0 && (
                        <span className="tag">{SCALE_LABELS[scores[dim.id]]}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {OCS_SCALE.map(s => (
                        <button
                          key={s.value}
                          onClick={() => setScore(dim.id, s.value)}
                          style={{
                            flex: 1, padding: '10px 4px',
                            border: `1px solid ${scores[dim.id] === s.value ? 'var(--navy)' : 'var(--line)'}`,
                            borderRadius: 4,
                            background: scores[dim.id] === s.value ? 'var(--navy)' : 'var(--cream)',
                            color: scores[dim.id] === s.value ? 'var(--cream)' : 'var(--charcoal)',
                            fontFamily: 'var(--font-body)', fontSize: 15,
                            fontWeight: scores[dim.id] === s.value ? 600 : 400,
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          {s.value}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--mute)', marginTop: 6, fontFamily: 'var(--font-body)' }}>
                      <span>Absent</span><span>Integrated</span>
                    </div>
                  </div>
                ))}
              </div>

              {allScored && (
                <div className="card" style={{ maxWidth: 640, marginTop: 28, background: 'var(--navy)', color: 'var(--cream)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, margin: '0 0 12px', color: 'var(--gold)' }}>
                    Your check-in
                  </h3>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {OCS_DIMENSIONS.map(d => (
                      <div key={d.id} style={{ textAlign: 'center', minWidth: 80 }}>
                        <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
                          {scores[d.id]}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(245,238,217,0.7)' }}>{d.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Post-session */}
          {tab === 'post' && (
            <>
              <div style={{ maxWidth: 560, marginBottom: 28 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
                  Leaving — body and mind, right now. Endings are part of the work. Whatever shifted today is allowed to be small.
                </p>
              </div>
              <ReflectiveQuestions
                questions={POST_QUESTIONS}
                values={postAnswers}
                onChange={setPostAnswer}
              />
            </>
          )}

          <ShareWithMentor
            onShare={handleShare}
            saving={saving} saved={saved} error={error} lastShared={lastShared}
            hasContent={hasContent}
          />

          <div style={{ marginTop: 20 }}>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back to dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
