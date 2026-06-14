import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '24px 20px' }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 44,
        color: 'var(--navy)', lineHeight: 1, marginBottom: 6,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--charcoal)', marginBottom: 2 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--mute)' }}>{sub}</div>}
    </div>
  )
}

export default function DirectorDashboard() {
  const { user, profile } = useAuth()

  const [stats, setStats] = useState({ mentors: 0, clients: 0, pendingApps: 0, sessionsThisMonth: 0 })
  const [mentors, setMentors] = useState([])   // [{ id, full_name, email, clientCount, lastSession }]
  const [pendingApps, setPendingApps] = useState([])
  const [unseenResponses, setUnseenResponses] = useState(0)
  const [loading, setLoading] = useState(true)

  // Invite mentor form
  const [inviteForm, setInviteForm] = useState({ fullName: '', email: '' })
  const [inviting, setInviting] = useState(false)
  const [inviteFlash, setInviteFlash] = useState('')
  const [inviteError, setInviteError] = useState('')

  useEffect(() => {
    if (!user) return
    load()
  }, [user])

  async function load() {
    setLoading(true)

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const [
      mentorRes,
      clientRes,
      appRes,
      sessionRes,
      unseenRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email').eq('role', 'mentor'),
      supabase.from('profiles').select('id, full_name, email, mentor_id, created_at').eq('role', 'mentee'),
      supabase.from('applications').select('id, full_name, email, created_at, status').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('sessions').select('id, mentee_id, scheduled_at, status').gte('scheduled_at', monthStart.toISOString()),
      supabase.from('tool_responses').select('id', { count: 'exact' }).eq('seen_by_mentor', false),
    ])

    const allMentors = mentorRes.data ?? []
    const allClients = clientRes.data ?? []
    const allSessions = sessionRes.data ?? []

    // Build caseload per mentor
    const caseloads = allMentors.map(m => {
      const myClients = allClients.filter(c => c.mentor_id === m.id)
      const mySessions = allSessions.filter(s => myClients.some(c => c.id === s.mentee_id))
      return {
        ...m,
        clientCount: myClients.length,
        sessionsThisMonth: mySessions.length,
      }
    })

    setMentors(caseloads)
    setPendingApps(appRes.data ?? [])
    setUnseenResponses(unseenRes.count ?? 0)
    setStats({
      mentors:           allMentors.length,
      clients:           allClients.length,
      pendingApps:       (appRes.data ?? []).length,
      sessionsThisMonth: allSessions.length,
    })
    setLoading(false)
  }

  async function sendInvite(e) {
    e.preventDefault()
    if (!inviteForm.fullName.trim() || !inviteForm.email.trim()) return
    setInviting(true)
    setInviteFlash('')
    setInviteError('')

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const res = await fetch('/.netlify/functions/invite-mentor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ fullName: inviteForm.fullName, email: inviteForm.email }),
    })

    const resBody = await res.json().catch(() => ({}))
    if (!res.ok) {
      setInviteError(resBody.error || 'Invite failed — check the console.')
    } else {
      setInviteFlash(`Invite sent to ${inviteForm.email}. They'll receive an email to set their password.`)
      setInviteForm({ fullName: '', email: '' })
      await load()
    }
    setInviting(false)
    setTimeout(() => { setInviteFlash(''); setInviteError('') }, 8000)
  }

  function fmt(ts) {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">

          <div className="journal-head">
            <div className="eyebrow">Director Overview</div>
            <h1>OurPath OS</h1>
            <p className="pull">Caseloads, team, applications, and platform activity.</p>
          </div>

          {/* ── Stats ── */}
          {loading ? (
            <div className="loading">Loading…</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
                <StatCard label="Active mentors" value={stats.mentors} />
                <StatCard label="Clients" value={stats.clients} sub="all mentees" />
                <StatCard label="Pending applications" value={stats.pendingApps} />
                <StatCard label="Sessions this month" value={stats.sessionsThisMonth} />
                {unseenResponses > 0 && (
                  <StatCard label="Unseen tool responses" value={unseenResponses} sub="across all mentors" />
                )}
              </div>

              {/* ── Mentor caseloads ── */}
              <div className="card" style={{ marginBottom: 28 }}>
                <div className="card-title">
                  <h3>Mentor team</h3>
                  <span className="tag">{mentors.length} mentors</span>
                </div>

                {mentors.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--mute)', fontStyle: 'italic' }}>
                    No mentor accounts yet. Invite one below.
                  </p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                        {['Mentor', 'Email', 'Clients', 'Sessions this month', ''].map(h => (
                          <th key={h} style={{
                            padding: '8px 10px', fontSize: 11,
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                            color: 'var(--mute)', fontWeight: 600,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mentors.map(m => (
                        <tr key={m.id} style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px 10px', color: 'var(--navy)', fontWeight: 500 }}>
                            {m.full_name ?? '—'}
                          </td>
                          <td style={{ padding: '12px 10px', color: 'var(--ink-soft)' }}>
                            {m.email}
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{
                              background: m.clientCount > 0 ? 'rgba(27,43,75,0.08)' : 'transparent',
                              color: m.clientCount > 0 ? 'var(--navy)' : 'var(--mute)',
                              padding: m.clientCount > 0 ? '3px 8px' : 0,
                              borderRadius: 10, fontSize: 13, fontWeight: 600,
                            }}>
                              {m.clientCount}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', color: 'var(--charcoal)' }}>
                            {m.sessionsThisMonth}
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <Link
                              to={`/mentor`}
                              style={{ fontSize: 12, color: 'var(--gold)' }}
                            >
                              View console →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* ── Pending applications ── */}
              {pendingApps.length > 0 && (
                <div className="card" style={{ marginBottom: 28 }}>
                  <div className="card-title">
                    <h3>Pending applications</h3>
                    <span className="tag" style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)' }}>
                      {pendingApps.length} waiting
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pendingApps.map(a => (
                      <div key={a.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', background: 'var(--off-white)',
                        borderRadius: 4, border: '1px solid var(--line)',
                      }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--navy)' }}>{a.full_name}</div>
                          <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 2 }}>{a.email} · Applied {fmt(a.created_at)}</div>
                        </div>
                        <Link to="/mentor/applications" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
                          Review →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Invite mentor ── */}
              <div className="card">
                <div className="card-title">
                  <h3>Invite a mentor</h3>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 18, lineHeight: 1.6 }}>
                  Enter their name and email. They'll receive an invite to set their password and access the mentor console.
                </p>

                {inviteFlash && (
                  <div className="auth-success" style={{ marginBottom: 14 }}>{inviteFlash}</div>
                )}
                {inviteError && (
                  <div className="auth-error" style={{ marginBottom: 14 }}>{inviteError}</div>
                )}

                <form onSubmit={sendInvite} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={inviteForm.fullName}
                    onChange={e => setInviteForm(f => ({ ...f, fullName: e.target.value }))}
                    required
                    style={{
                      flex: '1 0 180px', padding: '10px 12px',
                      border: '1px solid var(--line)', borderRadius: 4,
                      background: 'var(--cream)', color: 'var(--navy)',
                      fontFamily: 'inherit', fontSize: 14,
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={inviteForm.email}
                    onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                    required
                    style={{
                      flex: '2 0 220px', padding: '10px 12px',
                      border: '1px solid var(--line)', borderRadius: 4,
                      background: 'var(--cream)', color: 'var(--navy)',
                      fontFamily: 'inherit', fontSize: 14,
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={inviting}
                    style={{ alignSelf: 'stretch' }}
                  >
                    {inviting ? 'Sending…' : 'Send invite'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
