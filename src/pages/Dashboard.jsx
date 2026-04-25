import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'

function greeting(name) {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${name}.`
  if (hour < 17) return `Good afternoon, ${name}.`
  return `Good evening, ${name}.`
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })
}

function daysUntil(d) {
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff} days`
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [nextSession, setNextSession] = useState(null)
  const [lastJournal, setLastJournal] = useState(null)
  const [stats, setStats] = useState({ sessions: 0, entries: 0, commitments: 0 })
  const [commitments, setCommitments] = useState([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  useEffect(() => {
    if (!user) return
    async function load() {
      const [sessionRes, journalRes, statsSessionRes, statsJournalRes, commitRes] = await Promise.all([
        supabase
          .from('sessions')
          .select('*')
          .eq('mentee_id', user.id)
          .eq('status', 'scheduled')
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('sessions')
          .select('id', { count: 'exact' })
          .eq('mentee_id', user.id),
        supabase
          .from('journal_entries')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('commitments')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', false)
          .order('created_at', { ascending: false })
          .limit(3),
      ])

      setNextSession(sessionRes.data)
      setLastJournal(journalRes.data)
      setStats({
        sessions: statsSessionRes.count ?? 0,
        entries: statsJournalRes.count ?? 0,
        commitments: commitRes.data?.length ?? 0,
      })
      setCommitments(commitRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  async function toggleCommitment(id, done) {
    await supabase.from('commitments').update({ completed: !done }).eq('id', id)
    setCommitments(cs => cs.map(c => c.id === id ? { ...c, completed: !done } : c))
  }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div className="topline">
            <div className="hello">
              <div className="date">{today}</div>
              <h1>{greeting(firstName)}</h1>
              <div className="greet-line">A quiet start before anything else.</div>
            </div>
            <div className="r-side">
              <Link to="/journal" className="btn btn-ghost btn-sm">Open journal</Link>
              <div className="avatar">
                {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?'}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading your portal…</div>
          ) : (
            <div className="grid-2">
              <div>
                {nextSession ? (
                  <div className="card session-card">
                    <div className="card-title">
                      <h3>Your next session</h3>
                      <span className="tag">{daysUntil(nextSession.scheduled_at)}</span>
                    </div>
                    <div className="when">{formatDate(nextSession.scheduled_at)}</div>
                    <div className="with">With Shakil · 60 minutes</div>
                    <div style={{ marginBottom: 16 }}>
                      <span className="mode-badge">{nextSession.mode ?? 'Video'}</span>
                      <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                        Meet link sent 30 minutes before.
                      </span>
                    </div>
                    <div className="row">
                      <Link to="/journal" className="btn btn-primary btn-sm">Prepare for session</Link>
                      <Link to="/sessions" className="btn btn-ghost btn-sm">Reschedule</Link>
                    </div>
                  </div>
                ) : (
                  <div className="card session-card">
                    <div className="card-title">
                      <h3>No upcoming session</h3>
                    </div>
                    <p>You don't have a session booked yet.</p>
                    <Link to="/sessions" className="btn btn-primary btn-sm">Book a session</Link>
                  </div>
                )}

                {lastJournal && (lastJournal.q2 || lastJournal.freewrite_content) && (
                  <div className="card">
                    <div className="card-title">
                      <h3>Where you are right now</h3>
                      <span className="tag">From last journal</span>
                    </div>
                    <p style={{
                      fontFamily: 'Fraunces, serif', fontStyle: 'italic',
                      fontSize: 16, color: 'var(--teal)', lineHeight: 1.6,
                    }}>
                      "{(lastJournal.q1 || lastJournal.freewrite_content || '').slice(0, 200)}
                      {(lastJournal.q1 || lastJournal.freewrite_content || '').length > 200 ? '…' : ''}"
                    </p>
                    <div className="divider" />
                    <div className="row muted small">
                      <span>
                        Captured {new Date(lastJournal.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                      </span>
                      <span>·</span>
                      <span>{lastJournal.type === 'freewrite' ? 'Freewrite' : 'Five questions'}</span>
                    </div>
                  </div>
                )}

                {!lastJournal && (
                  <div className="card">
                    <div className="card-title"><h3>Your journal</h3></div>
                    <p>You haven't written yet. There's no pressure — but when you're ready, it's here.</p>
                    <Link to="/journal" className="btn btn-primary btn-sm">Begin first entry</Link>
                  </div>
                )}
              </div>

              <div>
                <div className="grid-3" style={{ marginBottom: 20 }}>
                  <div className="stat"><div className="n">{stats.sessions}</div><div className="l">Sessions</div></div>
                  <div className="stat"><div className="n">{stats.entries}</div><div className="l">Journal entries</div></div>
                  <div className="stat"><div className="n">{stats.commitments}</div><div className="l">Open commitments</div></div>
                </div>

                <div className="card">
                  <div className="card-title">
                    <h3>Commitments you named</h3>
                  </div>
                  {commitments.length === 0 ? (
                    <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--mute)' }}>
                      No open commitments yet. They'll show up after your first session.
                    </p>
                  ) : (
                    commitments.map(c => (
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
                  <Link to="/notes" style={{ fontSize: 13, display: 'inline-block', marginTop: 10 }}>
                    View all commitments →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
