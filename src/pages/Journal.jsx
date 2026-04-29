import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'

const QUESTIONS = [
  {
    num: '01 · Current Reality',
    title: 'Where are you, actually?',
    prompt: 'Not where you\'d like to be. Not where you think you should be. What is present right now — in your work, your relationships, your inner life?',
    column: 'question_1_current_reality',
  },
  {
    num: '02 · Pressure & Cost',
    title: 'What is this costing you?',
    prompt: 'Where is the strain showing up — in your body, your time, your relationships? What have you stopped noticing because it\'s become normal?',
    column: 'question_2_pressure_cost',
  },
  {
    num: '03 · Clarity & Learning',
    title: 'What is becoming clearer?',
    prompt: 'What have you learned — about yourself, about the situation, about what matters — that you didn\'t see before? Even something small.',
    column: 'question_3_clarity_learning',
  },
  {
    num: '04 · Direction',
    title: 'What is the next honest step?',
    prompt: 'Not the whole path. Not the transformation. The next action that would be small, true, and yours.',
    column: 'question_4_direction',
  },
  {
    num: '05 · Orientation',
    title: 'Who are you becoming, and is that the direction you want?',
    prompt: 'A position statement. Not an outcome. Where is your compass pointing, and does it match what you say matters?',
    column: 'question_5_orientation',
  },
]

const EMPTY_ANSWERS = QUESTIONS.reduce((acc, q) => ({ ...acc, [q.column]: '' }), {})

function wordCount(text = '') {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function formatPastDate(d) {
  const date = new Date(d)
  const now = new Date()
  const sameYear = date.getFullYear() === now.getFullYear()
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

function entrySnippet(entry) {
  if (entry.mode === 'freewrite') {
    return (entry.freewrite_text || '').trim()
  }
  for (const q of QUESTIONS) {
    if (entry[q.column]?.trim()) return entry[q.column].trim()
  }
  return ''
}

export default function Journal() {
  const { user } = useAuth()
  const [mode, setMode] = useState('structured') // 'structured' | 'freewrite'
  const [entryId, setEntryId] = useState(null)
  const [answers, setAnswers] = useState(EMPTY_ANSWERS)
  const [freewrite, setFreewrite] = useState('')
  const [saveState, setSaveState] = useState('') // 'saving' | 'saved' | ''
  const [shareConfirm, setShareConfirm] = useState(false)
  const [shareWithMentor, setShareWithMentor] = useState(false)
  const [pastEntries, setPastEntries] = useState([])
  const [openEntryId, setOpenEntryId] = useState(null)
  const saveTimer = useRef(null)

  useEffect(() => {
    loadTodayEntry()
    loadPastEntries()
  }, [user, mode])

  async function loadTodayEntry() {
    if (!user) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('mentee_id', user.id)
      .eq('mode', mode)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      setEntryId(data.id)
      if (mode === 'structured') {
        setAnswers(QUESTIONS.reduce((acc, q) => ({ ...acc, [q.column]: data[q.column] || '' }), {}))
      } else {
        setFreewrite(data.freewrite_text || '')
      }
      setShareWithMentor(data.shared_with_mentor || false)
    } else {
      setEntryId(null)
      setAnswers(EMPTY_ANSWERS)
      setFreewrite('')
      setShareWithMentor(false)
    }
  }

  // Load every entry for this mentee + mode that ISN'T today's. Used to render
  // the "Past entries" archive below the editable form.
  async function loadPastEntries() {
    if (!user) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('mentee_id', user.id)
      .eq('mode', mode)
      .lt('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    setPastEntries(data ?? [])
  }

  function scheduleAutoSave(newAnswers, newFreewrite) {
    clearTimeout(saveTimer.current)
    setSaveState('saving')
    saveTimer.current = setTimeout(() => {
      doSave(newAnswers, newFreewrite, shareWithMentor, false)
    }, 1500)
  }

  function updateAnswer(column, val) {
    const next = { ...answers, [column]: val }
    setAnswers(next)
    scheduleAutoSave(next, freewrite)
  }

  function updateFreewrite(val) {
    setFreewrite(val)
    scheduleAutoSave(answers, val)
  }

  async function doSave(ans, fw, shared, showConfirm) {
    if (!user) return
    setSaveState('saving')
    const payload = {
      mentee_id: user.id,
      mode,
      ...QUESTIONS.reduce((acc, q) => ({ ...acc, [q.column]: ans[q.column] || null }), {}),
      freewrite_text: fw || null,
      shared_with_mentor: shared,
      updated_at: new Date().toISOString(),
    }

    if (entryId) {
      await supabase.from('journal_entries').update(payload).eq('id', entryId)
    } else {
      const { data } = await supabase.from('journal_entries').insert(payload).select().single()
      if (data) setEntryId(data.id)
    }
    setSaveState('saved')
    if (showConfirm && shared) setShareConfirm(true)
    setTimeout(() => setSaveState(''), 3000)
  }

  const totalWords = mode === 'structured'
    ? Object.values(answers).reduce((s, v) => s + wordCount(v), 0)
    : wordCount(freewrite)

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div className="journal-head">
            <div className="eyebrow">
              {mode === 'structured' ? 'Muhāsabah · Reflective entry' : 'Tadabbur · Freewrite'}
            </div>
            <h1>{mode === 'structured' ? 'The Five Questions' : 'Write whatever is there.'}</h1>
            <p className="pull">
              {mode === 'structured'
                ? 'Take your time. You don\'t have to answer every question. What matters is that what you write is true — not tidy.'
                : 'No prompts. No structure. Write until you\'ve said the thing you were avoiding. Or don\'t — some days the avoidance is the data.'}
            </p>
          </div>

          <div className="mode-toggle">
            <button className={mode === 'structured' ? 'on' : ''} onClick={() => setMode('structured')}>
              Structured · Five questions
            </button>
            <button className={mode === 'freewrite' ? 'on' : ''} onClick={() => setMode('freewrite')}>
              Freewrite
            </button>
          </div>

          {mode === 'structured' ? (
            <>
              {QUESTIONS.map(q => (
                <div key={q.column} className="question-block">
                  <div className="q-num">{q.num}</div>
                  <div className="q-title">{q.title}</div>
                  <div className="q-prompt">{q.prompt}</div>
                  <div className="q-box">
                    <textarea
                      value={answers[q.column]}
                      onChange={e => updateAnswer(q.column, e.target.value)}
                      placeholder="Write what's true…"
                    />
                    <div className="q-meta">
                      <span>{wordCount(answers[q.column])} words</span>
                      {saveState === 'saved' && <span className="save-state">Saved a moment ago</span>}
                      {saveState === 'saving' && <span className="save-state" style={{ color: 'var(--mute)' }}>Saving…</span>}
                    </div>
                  </div>
                </div>
              ))}

              {shareConfirm && (
                <div className="auth-success" style={{ marginBottom: 16 }}>
                  Shared with Shakil. He'll read it before your next session.
                </div>
              )}

              <div className="row" style={{ marginTop: 26 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => doSave(answers, freewrite, shareWithMentor, false)}
                >
                  Save entry
                </button>
                <button
                  className={'btn btn-ghost' + (shareWithMentor ? ' btn-primary' : '')}
                  style={shareWithMentor ? { background: 'var(--teal)', color: 'var(--cream)' } : {}}
                  onClick={() => {
                    const next = !shareWithMentor
                    setShareWithMentor(next)
                    doSave(answers, freewrite, next, true)
                  }}
                >
                  {shareWithMentor ? '✓ Shared with Shakil' : 'Share with Shakil (optional)'}
                </button>
                <span className="muted small" style={{ marginLeft: 'auto' }}>
                  Only shared if you tick. Your words are yours.
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="freewrite-box">
                <textarea
                  value={freewrite}
                  onChange={e => updateFreewrite(e.target.value)}
                  placeholder="Start anywhere. Don't edit as you go."
                />
              </div>
              <div className="row" style={{ marginTop: 20 }}>
                <span className="muted small">{totalWords} words · saved continuously</span>
                <span style={{ marginLeft: 'auto' }} className="muted small">
                  Only you see this unless you share it
                </span>
              </div>
              <div className="row" style={{ marginTop: 16 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => doSave(answers, freewrite, shareWithMentor, false)}
                >
                  Save entry
                </button>
                <button
                  className={'btn btn-ghost btn-sm' + (shareWithMentor ? '' : '')}
                  style={shareWithMentor ? { background: 'var(--teal)', color: 'var(--cream)', border: '1px solid var(--teal)' } : {}}
                  onClick={() => {
                    const next = !shareWithMentor
                    setShareWithMentor(next)
                    doSave(answers, freewrite, next, true)
                  }}
                >
                  {shareWithMentor ? '✓ Shared with Shakil' : 'Share with Shakil'}
                </button>
              </div>
            </>
          )}

          {/* ──────────────── Past entries ──────────────── */}
          {pastEntries.length > 0 && (
            <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--line)' }}>
              <div className="journal-head" style={{ borderBottom: 'none', marginBottom: 18 }}>
                <div className="eyebrow">
                  Past entries · {pastEntries.length} {mode === 'freewrite' ? 'freewrite' : 'reflective'}
                </div>
                <h2 style={{ color: 'var(--teal)', fontFamily: 'Fraunces, serif' }}>What you've sat with before</h2>
                <p className="pull">
                  Old entries are read-only — they're a record of where you were on each day.
                  Click one to expand.
                </p>
              </div>

              {pastEntries.map(entry => {
                const isOpen = openEntryId === entry.id
                const snippet = entrySnippet(entry)
                return (
                  <div
                    key={entry.id}
                    className="card"
                    style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenEntryId(isOpen ? null : entry.id)}
                      style={{
                        width: '100%', textAlign: 'left',
                        background: 'transparent', border: 'none',
                        padding: '16px 20px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 14,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: 'Fraunces, serif', fontSize: 15,
                          color: 'var(--teal)', marginBottom: 2,
                        }}>
                          {formatPastDate(entry.created_at)}
                        </div>
                        <div style={{
                          fontSize: 13, color: 'var(--mute)', fontStyle: 'italic',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {snippet ? snippet.slice(0, 120) + (snippet.length > 120 ? '…' : '') : '(empty)'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {entry.shared_with_mentor && (
                          <span className="tag" style={{
                            background: 'var(--teal)', color: 'var(--cream)',
                            fontSize: 10, padding: '3px 8px',
                          }}>
                            Shared
                          </span>
                        )}
                        <span style={{
                          fontSize: 18, color: 'var(--mute)',
                          transform: isOpen ? 'rotate(90deg)' : 'none',
                          transition: 'transform 0.15s',
                        }}>
                          ›
                        </span>
                      </div>
                    </button>

                    {isOpen && (
                      <div style={{
                        padding: '0 20px 20px',
                        borderTop: '1px solid var(--line)',
                      }}>
                        {entry.mode === 'freewrite' ? (
                          entry.freewrite_text ? (
                            <p style={{
                              fontFamily: 'Fraunces, serif', fontSize: 16,
                              lineHeight: 1.7, color: 'var(--ink-soft)',
                              whiteSpace: 'pre-wrap', marginTop: 16,
                            }}>
                              {entry.freewrite_text}
                            </p>
                          ) : (
                            <p style={{ fontStyle: 'italic', color: 'var(--mute)', marginTop: 16 }}>
                              (Empty freewrite.)
                            </p>
                          )
                        ) : (
                          <div style={{ marginTop: 14 }}>
                            {QUESTIONS.map(q => {
                              const val = entry[q.column]
                              if (!val || !val.trim()) return null
                              return (
                                <div key={q.column} style={{ marginBottom: 18 }}>
                                  <div style={{
                                    fontFamily: 'Fraunces, serif', fontSize: 12,
                                    color: 'var(--gold)', letterSpacing: '0.15em',
                                    textTransform: 'uppercase', marginBottom: 4,
                                  }}>
                                    {q.num}
                                  </div>
                                  <div style={{
                                    fontFamily: 'Fraunces, serif', fontSize: 15,
                                    color: 'var(--teal)', marginBottom: 6,
                                  }}>
                                    {q.title}
                                  </div>
                                  <p style={{
                                    fontSize: 15, lineHeight: 1.65,
                                    color: 'var(--ink-soft)', whiteSpace: 'pre-wrap', margin: 0,
                                  }}>
                                    {val}
                                  </p>
                                </div>
                              )
                            })}

                            {!QUESTIONS.some(q => entry[q.column]?.trim()) && (
                              <p style={{ fontStyle: 'italic', color: 'var(--mute)', marginTop: 14 }}>
                                (No questions answered.)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
