import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'

const QUESTIONS = [
  {
    num: '01 · Current Reality',
    title: 'Where are you, actually?',
    prompt: 'Not where you\'d like to be. Not where you think you should be. What is present right now — in your work, your relationships, your inner life?',
    key: 'q1',
  },
  {
    num: '02 · Pressure & Cost',
    title: 'What is this costing you?',
    prompt: 'Where is the strain showing up — in your body, your time, your relationships? What have you stopped noticing because it\'s become normal?',
    key: 'q2',
  },
  {
    num: '03 · Clarity & Learning',
    title: 'What is becoming clearer?',
    prompt: 'What have you learned — about yourself, about the situation, about what matters — that you didn\'t see before? Even something small.',
    key: 'q3',
  },
  {
    num: '04 · Direction',
    title: 'What is the next honest step?',
    prompt: 'Not the whole path. Not the transformation. The next action that would be small, true, and yours.',
    key: 'q4',
  },
  {
    num: '05 · Orientation',
    title: 'Who are you becoming, and is that the direction you want?',
    prompt: 'A position statement. Not an outcome. Where is your compass pointing, and does it match what you say matters?',
    key: 'q5',
  },
]

function wordCount(text = '') {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export default function Journal() {
  const { user } = useAuth()
  const [mode, setMode] = useState('structured')
  const [entryId, setEntryId] = useState(null)
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '' })
  const [freewrite, setFreewrite] = useState('')
  const [saveState, setSaveState] = useState('') // 'saving' | 'saved' | ''
  const [shareConfirm, setShareConfirm] = useState(false)
  const [shareWithMentor, setShareWithMentor] = useState(false)
  const saveTimer = useRef(null)

  useEffect(() => {
    loadTodayEntry()
  }, [user, mode])

  async function loadTodayEntry() {
    if (!user) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', mode)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      setEntryId(data.id)
      if (mode === 'structured') {
        setAnswers({ q1: data.q1 || '', q2: data.q2 || '', q3: data.q3 || '', q4: data.q4 || '', q5: data.q5 || '' })
      } else {
        setFreewrite(data.freewrite_content || '')
      }
      setShareWithMentor(data.shared_with_mentor || false)
    } else {
      setEntryId(null)
      setAnswers({ q1: '', q2: '', q3: '', q4: '', q5: '' })
      setFreewrite('')
      setShareWithMentor(false)
    }
  }

  function scheduleAutoSave(newAnswers, newFreewrite) {
    clearTimeout(saveTimer.current)
    setSaveState('saving')
    saveTimer.current = setTimeout(() => {
      doSave(newAnswers, newFreewrite, shareWithMentor, false)
    }, 1500)
  }

  function updateAnswer(key, val) {
    const next = { ...answers, [key]: val }
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
      user_id: user.id,
      type: mode,
      q1: ans.q1, q2: ans.q2, q3: ans.q3, q4: ans.q4, q5: ans.q5,
      freewrite_content: fw,
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
                <div key={q.key} className="question-block">
                  <div className="q-num">{q.num}</div>
                  <div className="q-title">{q.title}</div>
                  <div className="q-prompt">{q.prompt}</div>
                  <div className="q-box">
                    <textarea
                      value={answers[q.key]}
                      onChange={e => updateAnswer(q.key, e.target.value)}
                      placeholder="Write what's true…"
                    />
                    <div className="q-meta">
                      <span>{wordCount(answers[q.key])} words</span>
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
        </div>
      </div>
    </div>
  )
}
