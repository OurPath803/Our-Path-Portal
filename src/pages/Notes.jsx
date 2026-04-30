import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'

export default function Notes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [commitments, setCommitments] = useState([])
  const [followUp, setFollowUp] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadNotes()
    loadCommitments()
  }, [user])

  async function loadNotes() {
    // Notes don't carry mentee_id directly — they're linked via session_id.
    // Fetch the user's sessions then the notes attached to those sessions.
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('id, scheduled_at, mode')
      .eq('mentee_id', user.id)
      .order('scheduled_at', { ascending: false })

    const sessionIds = (sessionsData ?? []).map(s => s.id)
    if (sessionIds.length === 0) {
      setNotes([])
      setLoading(false)
      return
    }

    const { data: noteRows } = await supabase
      .from('session_notes')
      .select('*')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false })

    // Hydrate session details onto each note for display.
    const sessionMap = Object.fromEntries((sessionsData ?? []).map(s => [s.id, s]))
    const hydrated = (noteRows ?? []).map(n => ({ ...n, session: sessionMap[n.session_id] || null }))

    setNotes(hydrated)
    if (hydrated.length) setSelectedNote(hydrated[0])
    setLoading(false)
  }

  async function loadCommitments() {
    const { data } = await supabase
      .from('commitments')
      .select('*')
      .eq('mentee_id', user.id)
      .order('created_at', { ascending: false })
    setCommitments(data ?? [])
  }

  async function toggleCommitment(id, done) {
    await supabase.from('commitments').update({ completed: !done }).eq('id', id)
    setCommitments(cs => cs.map(c => c.id === id ? { ...c, completed: !done } : c))
  }

  async function saveFollowUp() {
    if (!followUp.trim()) return
    setSaving(true)
    await supabase.from('journal_entries').insert({
      mentee_id: user.id,
      mode: 'freewrite',
      freewrite_text: followUp,
    })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Render `what_was_named` either as a list (one per line in the source text)
  // or as a single paragraph if it has no newlines.
  function renderNamedItems(text) {
    if (!text) return null
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length > 1) {
      return <ul>{lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
    }
    return <p>{text}</p>
  }

  const sessionCommitments = selectedNote
    ? commitments.filter(c => c.session_id === selectedNote.session_id)
    : commitments.slice(0, 6)

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          {loading ? (
            <div className="loading">Loading notes…</div>
          ) : notes.length === 0 ? (
            <>
              <div className="journal-head">
                <h1>Notes & commitments</h1>
                <p className="pull">
                  After each session, Ustadh Shakil will write notes here — what was covered,
                  what was named, and any commitments you made.
                </p>
              </div>

              {commitments.length > 0 ? (
                <div className="notes-layout">
                  <div>
                    <div className="note-block">
                      <h4>No session notes yet</h4>
                      <p>Notes will appear here after your first session with Ustadh Shakil.</p>
                    </div>
                  </div>
                  <div>
                    <div className="commitments-box">
                      <h4>Your commitments</h4>
                      {commitments.map(c => (
                        <div
                          key={c.id}
                          className={'commit' + (c.completed ? ' done' : '')}
                          onClick={() => toggleCommitment(c.id, c.completed)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="check" />
                          <div className="t">{c.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  Notes and commitments from your sessions will appear here.
                </div>
              )}
            </>
          ) : (
            <>
              {notes.length > 1 && (
                <div style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {notes.map(n => (
                    <button
                      key={n.id}
                      className={'btn btn-sm ' + (selectedNote?.id === n.id ? 'btn-primary' : 'btn-ghost')}
                      onClick={() => setSelectedNote(n)}
                    >
                      {formatDate(n.session?.scheduled_at ?? n.created_at)}
                    </button>
                  ))}
                </div>
              )}

              <div className="journal-head">
                <div className="eyebrow">
                  Session · {formatDate(selectedNote?.session?.scheduled_at ?? selectedNote?.created_at)}
                </div>
                <h1>Notes from our last conversation</h1>
                <p className="pull">
                  Written by Ustadh Shakil after the session. Nothing here is a prescription — it's what
                  was named, and what you said you'd sit with.
                </p>
              </div>

              <div className="note-meta">
                <div className="m">
                  <div className="l">Date</div>
                  <div className="v">{formatDate(selectedNote?.session?.scheduled_at ?? selectedNote?.created_at)}</div>
                </div>
                <div className="m">
                  <div className="l">Duration</div>
                  <div className="v">60 minutes · {selectedNote?.session?.mode ?? 'video'}</div>
                </div>
                <div className="m">
                  <div className="l">Framework</div>
                  <div className="v">{selectedNote?.framework_used ?? '—'}</div>
                </div>
              </div>

              <div className="notes-layout">
                <div>
                  {selectedNote?.ground_covered && (
                    <div className="note-block">
                      <h4>Ground covered</h4>
                      <p>{selectedNote.ground_covered}</p>
                    </div>
                  )}

                  {selectedNote?.what_was_named && (
                    <div className="note-block">
                      <h4>What was named</h4>
                      {renderNamedItems(selectedNote.what_was_named)}
                    </div>
                  )}

                  {selectedNote?.framework_used && (
                    <div className="note-block">
                      <h4>Framework in use</h4>
                      <p><strong>{selectedNote.framework_used}</strong></p>
                    </div>
                  )}

                  {selectedNote?.to_sit_with && (
                    <div className="note-block">
                      <h4>To sit with — not to solve</h4>
                      <p style={{
                        fontFamily: 'Fraunces, serif', fontStyle: 'italic',
                        color: 'var(--teal)', fontSize: 16,
                      }}>
                        "{selectedNote.to_sit_with}"
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="commitments-box">
                    <h4>Commitments you named</h4>
                    {sessionCommitments.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--mute)', fontStyle: 'italic' }}>
                        No commitments recorded for this session.
                      </p>
                    ) : (
                      sessionCommitments.map(c => (
                        <div
                          key={c.id}
                          className={'commit' + (c.completed ? ' done' : '')}
                          onClick={() => toggleCommitment(c.id, c.completed)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="check" />
                          <div className="t">{c.text}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="card" style={{ marginTop: 18 }}>
                    <h4 style={{ color: 'var(--teal)', fontFamily: 'Fraunces, serif', marginBottom: 8 }}>
                      Follow up here
                    </h4>
                    <textarea
                      placeholder="Write anything you'd like to carry into the next session."
                      style={{ minHeight: 120 }}
                      value={followUp}
                      onChange={e => setFollowUp(e.target.value)}
                    />
                    {saved && <div className="auth-success" style={{ marginTop: 8 }}>Saved to your journal.</div>}
                    <div className="row" style={{ marginTop: 10 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={saveFollowUp}
                        disabled={saving || !followUp.trim()}
                      >
                        {saving ? 'Saving…' : 'Save for next session'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
