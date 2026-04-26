import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const EMPTY_NOTE = {
  ground_covered: '',
  what_was_named_text: '',
  framework_in_use: '',
  question_to_sit_with: '',
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function MentorNotes() {
  const { menteeId } = useParams()
  const { user } = useAuth()

  const [mentee, setMentee] = useState(null)
  const [sessions, setSessions] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [noteRowId, setNoteRowId] = useState(null)
  const [note, setNote] = useState(EMPTY_NOTE)
  const [commitments, setCommitments] = useState([])
  const [newCommitment, setNewCommitment] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !menteeId) return
    loadMenteeAndSessions()
  }, [user, menteeId])

  useEffect(() => {
    if (selectedSessionId) loadNoteAndCommitments(selectedSessionId)
  }, [selectedSessionId])

  async function loadMenteeAndSessions() {
    setLoading(true)
    setError('')

    const { data: m, error: mErr } = await supabase
      .from('profiles')
      .select('id, full_name, email, rhythm')
      .eq('id', menteeId)
      .maybeSingle()

    if (mErr || !m) {
      setError('Mentee not found.')
      setLoading(false)
      return
    }
    setMentee(m)

    const { data: s } = await supabase
      .from('sessions')
      .select('id, scheduled_at, mode, status')
      .eq('mentee_id', menteeId)
      .order('scheduled_at', { ascending: false })

    setSessions(s ?? [])
    if (s && s.length > 0) setSelectedSessionId(s[0].id)
    setLoading(false)
  }

  async function loadNoteAndCommitments(sessionId) {
    const { data: existing } = await supabase
      .from('session_notes')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle()

    if (existing) {
      setNoteRowId(existing.id)
      setNote({
        ground_covered: existing.ground_covered ?? '',
        what_was_named_text: (existing.what_was_named ?? []).join('\n'),
        framework_in_use: existing.framework_in_use ?? '',
        question_to_sit_with: existing.question_to_sit_with ?? '',
      })
    } else {
      setNoteRowId(null)
      setNote(EMPTY_NOTE)
    }

    const { data: c } = await supabase
      .from('commitments')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    setCommitments(c ?? [])
  }

  function update(key, val) {
    setNote(n => ({ ...n, [key]: val }))
  }

  async function saveNote() {
    if (!selectedSessionId) return
    setSaving(true)
    const what_was_named = note.what_was_named_text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)

    const payload = {
      session_id: selectedSessionId,
      mentee_id: menteeId,
      mentor_id: user.id,
      ground_covered: note.ground_covered || null,
      what_was_named,
      framework_in_use: note.framework_in_use || null,
      question_to_sit_with: note.question_to_sit_with || null,
    }

    if (noteRowId) {
      await supabase.from('session_notes').update(payload).eq('id', noteRowId)
    } else {
      const { data } = await supabase.from('session_notes').insert(payload).select().single()
      if (data) setNoteRowId(data.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function addCommitment() {
    if (!newCommitment.trim() || !selectedSessionId) return
    const { data } = await supabase.from('commitments').insert({
      user_id: menteeId,
      session_id: selectedSessionId,
      text: newCommitment.trim(),
    }).select().single()
    if (data) setCommitments(cs => [...cs, data])
    setNewCommitment('')
  }

  async function removeCommitment(id) {
    await supabase.from('commitments').delete().eq('id', id)
    setCommitments(cs => cs.filter(c => c.id !== id))
  }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div style={{ marginBottom: 12 }}>
            <Link to="/mentor" style={{ fontSize: 13 }}>← All mentees</Link>
          </div>

          {loading ? (
            <div className="loading">Loading…</div>
          ) : error ? (
            <div className="auth-error">{error}</div>
          ) : (
            <>
              <div className="journal-head">
                <div className="eyebrow">
                  Notes for {mentee?.full_name ?? mentee?.email}
                  {mentee?.rhythm && ` · ${mentee.rhythm} rhythm`}
                </div>
                <h1>Session notes &amp; commitments</h1>
                <p className="pull">
                  Pick a session, write what was covered, and add the commitments your mentee named.
                </p>
              </div>

              {sessions.length === 0 ? (
                <div className="empty-state">
                  No sessions for this mentee yet. Notes will appear once a session is booked.
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
                    {sessions.map(s => (
                      <button
                        key={s.id}
                        className={'btn btn-sm ' + (selectedSessionId === s.id ? 'btn-primary' : 'btn-ghost')}
                        onClick={() => setSelectedSessionId(s.id)}
                      >
                        {formatDate(s.scheduled_at)}
                      </button>
                    ))}
                  </div>

                  <div className="grid-2">
                    <div className="card">
                      <div className="card-title">
                        <h3>Write the note</h3>
                        {saved && <span className="auth-success" style={{ margin: 0, padding: '4px 10px' }}>Saved</span>}
                      </div>

                      <div className="form-row">
                        <label>Ground covered</label>
                        <textarea
                          style={{ minHeight: 100 }}
                          value={note.ground_covered}
                          onChange={e => update('ground_covered', e.target.value)}
                          placeholder="What did this session actually cover?"
                        />
                      </div>

                      <div className="form-row">
                        <label>What was named</label>
                        <textarea
                          style={{ minHeight: 100 }}
                          value={note.what_was_named_text}
                          onChange={e => update('what_was_named_text', e.target.value)}
                          placeholder="One per line — each line becomes a separate item."
                        />
                        <div className="hint">Each line becomes its own bullet for the mentee.</div>
                      </div>

                      <div className="form-row">
                        <label>Framework in use</label>
                        <input
                          type="text"
                          value={note.framework_in_use}
                          onChange={e => update('framework_in_use', e.target.value)}
                          placeholder="e.g. Position Map, Cost Audit, Integration Filter"
                        />
                      </div>

                      <div className="form-row">
                        <label>Question to sit with</label>
                        <textarea
                          style={{ minHeight: 70 }}
                          value={note.question_to_sit_with}
                          onChange={e => update('question_to_sit_with', e.target.value)}
                          placeholder="A single question to carry into the week — not to solve."
                        />
                      </div>

                      <button className="btn btn-primary" onClick={saveNote} disabled={saving}>
                        {saving ? 'Saving…' : noteRowId ? 'Update note' : 'Save note'}
                      </button>
                    </div>

                    <div className="card">
                      <div className="card-title">
                        <h3>Commitments from this session</h3>
                      </div>

                      {commitments.length === 0 ? (
                        <p style={{ fontSize: 14, color: 'var(--mute)', fontStyle: 'italic', marginBottom: 14 }}>
                          No commitments yet for this session.
                        </p>
                      ) : (
                        commitments.map(c => (
                          <div key={c.id} className={'commit' + (c.completed ? ' done' : '')}>
                            <div className="check" />
                            <div className="t">{c.text}</div>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ marginLeft: 8, fontSize: 11, padding: '4px 8px' }}
                              onClick={() => removeCommitment(c.id)}
                              title="Remove"
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      )}

                      <div className="form-row" style={{ marginTop: 16 }}>
                        <label>Add a commitment</label>
                        <input
                          type="text"
                          value={newCommitment}
                          onChange={e => setNewCommitment(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCommitment() } }}
                          placeholder="What did they say they'd do?"
                        />
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={addCommitment}
                        disabled={!newCommitment.trim()}
                      >
                        Add commitment
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
