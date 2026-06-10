import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function MentorDashboard() {
  const { user, profile } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadMentees()
  }, [user])

  async function loadMentees() {
    // Mentors see only their assigned mentees. Admins see all mentees.
    const isAdmin = profile?.role === 'admin'
    const query = supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'mentee')
      .order('created_at', { ascending: false })
    if (!isAdmin) query.eq('mentor_id', user.id)
    const { data: mentees } = await query

    if (!mentees || mentees.length === 0) {
      setRows([])
      setLoading(false)
      return
    }

    const ids = mentees.map(m => m.id)

    // 2) Sessions count, unread messages, last journal, current rhythm.
    const [sessionsRes, unreadRes, journalsRes, subsRes] = await Promise.all([
      supabase
        .from('sessions')
        .select('mentee_id')
        .in('mentee_id', ids),
      supabase
        .from('messages')
        .select('sender_id')
        .eq('recipient_id', user.id)
        .is('read_at', null)
        .in('sender_id', ids),
      supabase
        .from('journal_entries')
        .select('mentee_id, created_at')
        .in('mentee_id', ids)
        .order('created_at', { ascending: false }),
      supabase
        .from('subscriptions')
        .select('mentee_id, rhythm, status, started_at')
        .in('mentee_id', ids)
        .order('started_at', { ascending: false }),
    ])

    const sessionCount = {}
    ;(sessionsRes.data ?? []).forEach(s => {
      sessionCount[s.mentee_id] = (sessionCount[s.mentee_id] ?? 0) + 1
    })

    const unreadCount = {}
    ;(unreadRes.data ?? []).forEach(m => {
      unreadCount[m.sender_id] = (unreadCount[m.sender_id] ?? 0) + 1
    })

    const lastJournal = {}
    ;(journalsRes.data ?? []).forEach(j => {
      if (!lastJournal[j.mentee_id]) lastJournal[j.mentee_id] = j.created_at
    })

    const currentSub = {}
    ;(subsRes.data ?? []).forEach(s => {
      if (!currentSub[s.mentee_id]) currentSub[s.mentee_id] = s
    })

    setRows(mentees.map(m => ({
      ...m,
      sessions: sessionCount[m.id] ?? 0,
      unread: unreadCount[m.id] ?? 0,
      lastJournal: lastJournal[m.id] ?? null,
      rhythm: currentSub[m.id]?.status === 'active' ? currentSub[m.id]?.rhythm : null,
    })))
    setLoading(false)
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div className="journal-head">
            <div className="eyebrow">Mentor view · {rows.length} {rows.length === 1 ? 'mentee' : 'mentees'}</div>
            <h1>Your mentees, {firstName}.</h1>
            <p className="pull">
              Each row is one person you're holding space for. Open their notes to write up
              the last session, or jump to messages.
            </p>
          </div>

          {loading ? (
            <div className="loading">Loading mentees…</div>
          ) : rows.length === 0 ? (
            <div className="empty-state">
              No mentees assigned yet. New signups are auto-assigned to you.
            </div>
          ) : (
            <div className="card scroll-table-wrap" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{
                    background: 'var(--cream-deep)',
                    color: 'var(--navy)',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 13,
                    textAlign: 'left',
                  }}>
                    <th style={{ padding: '14px 16px' }}>Mentee</th>
                    <th style={{ padding: '14px 16px' }}>Rhythm</th>
                    <th style={{ padding: '14px 16px' }}>Sessions</th>
                    <th style={{ padding: '14px 16px' }}>Unread</th>
                    <th style={{ padding: '14px 16px' }}>Last journal</th>
                    <th style={{ padding: '14px 16px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--line)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: 'var(--navy)', fontWeight: 500 }}>{r.full_name ?? '—'}</div>
                        <div style={{ fontSize: 12, color: 'var(--mute)' }}>{r.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', textTransform: 'capitalize' }}>
                        {r.rhythm ?? <span style={{ color: 'var(--mute)' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>{r.sessions}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {r.unread > 0
                          ? <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{r.unread}</span>
                          : <span style={{ color: 'var(--mute)' }}>0</span>}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--ink-soft)' }}>{formatDate(r.lastJournal)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Link
                          to={`/mentor/manage/${r.id}`}
                          className="btn btn-ghost btn-sm"
                          style={{ marginRight: 6 }}
                        >
                          Manage
                        </Link>
                        <Link
                          to={`/mentor/journal/${r.id}`}
                          className="btn btn-ghost btn-sm"
                          style={{ marginRight: 6 }}
                        >
                          Journal
                        </Link>
                        <Link
                          to={`/mentor/notes/${r.id}`}
                          className="btn btn-ghost btn-sm"
                          style={{ marginRight: 6 }}
                        >
                          Notes
                        </Link>
                        <Link to={`/between?with=${r.id}`} className="btn btn-primary btn-sm">
                          Messages
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
