import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
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

const TOOL_ROUTES = {
  'ocs-checkin':        { label: 'OCS Check-In',                path: '/tools/ocs-checkin',        description: 'Rate your five dimensions' },
  'nine-domains':       { label: 'Nine Reflection Domains',     path: '/tools/nine-domains',       description: 'Explore the nine territories' },
  'progress-review':    { label: 'Progress Review',             path: '/tools/progress-review',    description: 'Name what has shifted' },
  'clarity-map':        { label: 'Clarity Map',                 path: '/tools/clarity-map',        description: 'Sort what you know from what you assume' },
  'decision-sheet':     { label: 'Decision Discernment Sheet',  path: '/tools/decision-sheet',     description: 'Work through a live decision' },
  'energy-audit':       { label: 'Energy & Capacity Audit',     path: '/tools/energy-audit',       description: 'Audit what drains and sustains you' },
  'values-alignment':   { label: 'Values-to-Actions Alignment', path: '/tools/values-alignment',   description: 'Close the gap between values and action' },
  'position-map':       { label: 'Position Map',                path: '/tools/position-map',       description: 'See where you stand' },
  'cost-audit':         { label: 'Cost Audit',                  path: '/tools/cost-audit',         description: 'Name the cost of what you carry' },
  'integration-filter': { label: 'Integration Filter',          path: '/tools/integration-filter', description: 'Sort experience from accumulation' },
  'orientation':        { label: 'Orientation Framework',       path: '/tools/orientation',        description: 'Choose your direction deliberately' },
}

// Horizontal stat chip — matches mentor dashboard style
function StatChip({ value, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 18px',
      background: 'var(--off-white)',
      border: '1px solid var(--line)',
      borderRadius: 8,
      flex: '1 1 120px',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1,
        color: 'var(--navy)', fontWeight: 600,
      }}>
        {value}
      </span>
      <span style={{ fontSize: 12, color: 'var(--mute)', lineHeight: 1.3, fontWeight: 500 }}>
        {label}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [nextSession, setNextSession] = useState(null)
  const [lastJournal, setLastJournal] = useState(null)
  const [stats, setStats] = useState({ sessions: 0, entries: 0, commitments: 0 })
  const [commitments, setCommitments] = useState([])
  const [assignedTools, setAssignedTools] = useState([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  useEffect(() => {
    if (!user) return
    async function load() {
      const [sessionRes, journalRes, statsSessionRes, statsJournalRes, commitRes, toolRes] = await Promise.all([
        supabase.from('sessions').select('*').eq('mentee_id', user.id).eq('status', 'scheduled')
          .gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(1).maybeSingle(),
        supabase.from('journal_entries').select('*').eq('mentee_id', user.id)
          .order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('sessions').select('id', { count: 'exact' }).eq('mentee_id', user.id),
        supabase.from('journal_entries').select('id', { count: 'exact' }).eq('mentee_id', user.id),
        supabase.from('commitments').select('*').eq('mentee_id', user.id).eq('completed', false)
          .order('created_at', { ascending: false }).limit(5),
        supabase.from('tool_assignments').select('tool_slug').eq('mentee_id', user.id).is('revoked_at', null),
      ])
      setNextSession(sessionRes.data)
      setLastJournal(journalRes.data)
      setStats({
        sessions:    statsSessionRes.count ?? 0,
        entries:     statsJournalRes.count ?? 0,
        commitments: commitRes.data?.length ?? 0,
      })
      setCommitments(commitRes.data ?? [])
      setAssignedTools((toolRes.data ?? []).map(t => t.tool_slug))
      setLoading(false)
    }
    load()
  }, [user])

  async function toggleCommitment(id, done) {
    await supabase.from('commitments').update({ completed: !done }).eq('id', id)
    setCommitments(cs => cs.map(c => c.id === id ? { ...c, completed: !done } : c))
  }

  const journalSnippet = lastJournal && (
    lastJournal.question_1_current_reality ||
    lastJournal.question_2_pressure_cost ||
    lastJournal.question_3_clarity_learning ||
    lastJournal.question_4_direction ||
    lastJournal.question_5_orientation ||
    lastJournal.freewrite_text || ''
  )

  if (profile && (profile.role === 'mentor' || profile.role === 'admin')) {
    return <Navigate to="/mentor" replace />
  }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">

          {/* ── Header ── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 28, gap: 16, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{
                fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--gold)', fontWeight: 600, marginBottom: 6,
              }}>
                {today}
              </div>
              <h1 style={{ margin: 0, lineHeight: 1.15 }}>{greeting(firstName)}</h1>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingTop: 4 }}>
              <Link to="/journal" className="btn btn-ghost btn-sm">Open journal</Link>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'var(--navy)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--cream)',
                fontWeight: 600, letterSpacing: '0.03em',
              }}>
                {profile?.full_name
                  ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  : '?'}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading your portal…</div>
          ) : (
            <>
              {/* ── Stat chips ── */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                <StatChip value={stats.sessions}    label="sessions completed" />
                <StatChip value={stats.entries}     label="journal entries" />
                <StatChip value={stats.commitments} label={`open commitment${stats.commitments !== 1 ? 's' : ''}`} />
              </div>

              {/* ── Two-column content ── */}
              <div className="grid-2">

                {/* Left: session + journal snippet */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {nextSession ? (
                    <div className="card" style={{
                      borderLeft: '3px solid var(--gold)',
                      background: 'var(--navy)',
                      color: 'var(--cream)',
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: 12,
                      }}>
                        <h3 style={{ color: 'var(--cream)', margin: 0 }}>Your next session</h3>
                        <span style={{
                          fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                          background: 'var(--gold)', color: 'var(--navy)',
                          padding: '3px 10px', borderRadius: 20, fontWeight: 700,
                        }}>
                          {daysUntil(nextSession.scheduled_at)}
                        </span>
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 18,
                        color: 'var(--gold)', marginBottom: 4,
                      }}>
                        {formatDate(nextSession.scheduled_at)}
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(250,250,248,0.65)', marginBottom: 18 }}>
                        With Ustadh Shakil · 60 minutes · Meet link sent 30 min before
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <Link to="/journal" className="btn btn-gold btn-sm">Prepare for session</Link>
                        <Link
                          to="/sessions"
                          style={{
                            display: 'inline-block', padding: '7px 14px',
                            fontSize: 13, color: 'rgba(250,250,248,0.65)',
                            borderBottom: 'none',
                          }}
                        >
                          Reschedule
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <h3 style={{ margin: 0 }}>Sessions</h3>
                      </div>
                      <p style={{ fontSize: 14 }}>No session booked yet.</p>
                      <Link to="/sessions" className="btn btn-primary btn-sm">Book a session</Link>
                    </div>
                  )}

                  {journalSnippet ? (
                    <div className="card">
                      <div style={{
                        fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: 'var(--gold)', fontWeight: 600, marginBottom: 10,
                      }}>
                        Where you are right now
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-display)', fontStyle: 'italic',
                        fontSize: 17, color: 'var(--navy)', lineHeight: 1.65, margin: 0,
                      }}>
                        "{journalSnippet.slice(0, 220)}{journalSnippet.length > 220 ? '…' : ''}"
                      </p>
                      <div style={{
                        marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span style={{ fontSize: 12, color: 'var(--mute)' }}>
                          {new Date(lastJournal.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                          {' · '}
                          {lastJournal.mode === 'freewrite' ? 'Freewrite' : 'Five questions'}
                        </span>
                        <Link to="/journal" style={{ fontSize: 12, color: 'var(--gold)', borderBottom: 'none' }}>
                          Write again →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="card">
                      <div style={{
                        fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: 'var(--gold)', fontWeight: 600, marginBottom: 10,
                      }}>
                        Journal
                      </div>
                      <p style={{ fontSize: 14 }}>
                        You haven't written yet. There's no pressure — but when you're ready, it's here.
                      </p>
                      <Link to="/journal" className="btn btn-primary btn-sm">Begin first entry</Link>
                    </div>
                  )}
                </div>

                {/* Right: commitments + tools */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="card">
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: 14,
                    }}>
                      <h3 style={{ margin: 0 }}>Commitments</h3>
                      {commitments.length > 0 && (
                        <span style={{
                          fontSize: 11, background: 'rgba(201,168,76,0.15)',
                          color: '#8B6914', fontWeight: 600,
                          padding: '3px 9px', borderRadius: 20, letterSpacing: '0.04em',
                        }}>
                          {commitments.length} open
                        </span>
                      )}
                    </div>

                    {commitments.length === 0 ? (
                      <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--mute)' }}>
                        No open commitments yet. They'll appear after your first session.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {commitments.map(c => (
                          <div
                            key={c.id}
                            onClick={() => toggleCommitment(c.id, c.completed)}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: 12,
                              padding: '10px 12px',
                              background: c.completed ? 'transparent' : 'var(--off-white)',
                              border: '1px solid var(--line)',
                              borderRadius: 6,
                              cursor: 'pointer',
                              opacity: c.completed ? 0.5 : 1,
                              transition: 'opacity 0.15s, background 0.15s',
                            }}
                          >
                            <div style={{
                              width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                              border: `2px solid ${c.completed ? 'var(--success)' : 'var(--line)'}`,
                              background: c.completed ? 'var(--success)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {c.completed && (
                                <span style={{ fontSize: 9, color: 'white', fontWeight: 700 }}>✓</span>
                              )}
                            </div>
                            <span style={{
                              fontSize: 14, color: 'var(--charcoal)', lineHeight: 1.5,
                              textDecoration: c.completed ? 'line-through' : 'none',
                            }}>
                              {c.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Link to="/notes" style={{ fontSize: 13, display: 'inline-block', marginTop: 12, color: 'var(--ink-soft)' }}>
                      View all commitments →
                    </Link>
                  </div>

                  {assignedTools.length > 0 && (
                    <div className="card">
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: 14,
                      }}>
                        <h3 style={{ margin: 0 }}>Your tools</h3>
                        <span style={{
                          fontSize: 11, background: 'var(--navy-light)', color: 'var(--navy)',
                          fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                        }}>
                          {assignedTools.length} assigned
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {assignedTools.map(slug => {
                          const tool = TOOL_ROUTES[slug]
                          if (!tool) return null
                          return (
                            <Link
                              key={slug}
                              to={tool.path}
                              style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '11px 14px',
                                background: 'var(--off-white)',
                                borderRadius: 6,
                                border: '1px solid var(--line)',
                                textDecoration: 'none',
                                transition: 'border-color 0.12s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
                            >
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--navy)' }}>
                                  {tool.label}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 2 }}>
                                  {tool.description}
                                </div>
                              </div>
                              <span style={{ fontSize: 14, color: 'var(--gold)', flexShrink: 0 }}>→</span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
