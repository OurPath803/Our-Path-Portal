/**
 * Profile — mentee profile summary page (/profile)
 *
 * Shows: avatar initial, name, email, member since date,
 * current subscription rhythm + status, total session count,
 * and assigned mentor name.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

// Initial avatar — first letter of first name, or email initial.
function Avatar({ name, email, size = 64 }) {
  const initial = (name?.trim()[0] ?? email?.[0] ?? '?').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--navy)', color: 'var(--cream)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontSize: size * 0.42,
      flexShrink: 0,
      border: '2px solid var(--gold)',
    }}>
      {initial}
    </div>
  )
}

export default function Profile() {
  const { user, profile } = useAuth()
  const [sub, setSub] = useState(null)
  const [sessionCount, setSessionCount] = useState(null)
  const [mentorName, setMentorName] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    load()
  }, [user?.id])

  async function load() {
    setLoading(true)

    const [subRes, sessionsRes] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('rhythm, status, started_at, stripe_subscription_id')
        .eq('mentee_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('sessions')
        .select('id', { count: 'exact' })
        .eq('mentee_id', user.id)
        .eq('status', 'completed'),
    ])

    setSub(subRes.data ?? null)
    setSessionCount(sessionsRes.count ?? 0)

    // Fetch assigned mentor's name if mentor_id present
    if (profile?.mentor_id) {
      const { data: mentor } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', profile.mentor_id)
        .maybeSingle()
      setMentorName(mentor?.full_name ?? null)
    }

    setLoading(false)
  }

  const RHYTHM_LABEL = {
    weekly: 'Weekly · 4 sessions/month',
    fortnightly: 'Fortnightly · 2 sessions/month',
    monthly: 'Monthly · 1 session/month',
  }

  const STATUS_STYLE = {
    active:    { bg: 'rgba(39,174,96,0.09)', color: 'var(--success)', border: 'rgba(39,174,96,0.22)' },
    paused:    { bg: 'var(--cream-deep)', color: 'var(--mute)', border: 'var(--line)' },
    cancelled: { bg: 'rgba(192,57,43,0.07)', color: 'var(--danger)', border: 'rgba(192,57,43,0.22)' },
  }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">

          {/* Header */}
          <div className="journal-head">
            <div className="eyebrow">Your profile</div>
            <h1>Account overview</h1>
          </div>

          {loading ? (
            <div className="loading">Loading…</div>
          ) : (
            <div style={{ maxWidth: 640 }}>

              {/* Identity card */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                  <Avatar name={profile?.full_name} email={user?.email} />
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      fontFamily: 'var(--font-display)', fontSize: 28,
                      color: 'var(--navy)', margin: '0 0 4px',
                    }}>
                      {profile?.full_name ?? '—'}
                    </h2>
                    <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 8 }}>
                      {user?.email}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--mute)' }}>
                      Member since {formatDate(profile?.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
                <div className="stat">
                  <div className="n">{sessionCount ?? '—'}</div>
                  <div className="l">Sessions completed</div>
                </div>
                <div className="stat">
                  <div className="n" style={{ fontSize: sub ? 22 : 28 }}>
                    {sub ? (RHYTHM_LABEL[sub.rhythm]?.split(' · ')[0] ?? sub.rhythm) : '—'}
                  </div>
                  <div className="l">Session rhythm</div>
                </div>
                <div className="stat">
                  <div style={{
                    fontFamily: 'Cormorant Garamond, serif', fontSize: 16,
                    lineHeight: 1.2, marginBottom: 6, marginTop: 4,
                    color: 'var(--navy)',
                  }}>
                    {mentorName ?? '—'}
                  </div>
                  <div className="l">Your mentor</div>
                </div>
              </div>

              {/* Subscription detail */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title">
                  <h3>Subscription</h3>
                  {sub && (() => {
                    const s = STATUS_STYLE[sub.status] ?? STATUS_STYLE.paused
                    return (
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 3,
                        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                        fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                        fontWeight: 600,
                      }}>
                        {sub.status}
                      </span>
                    )
                  })()}
                </div>

                {!sub ? (
                  <p style={{ fontSize: 14, color: 'var(--mute)', fontStyle: 'italic' }}>
                    No subscription found. Contact{' '}
                    <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { l: 'Rhythm', v: RHYTHM_LABEL[sub.rhythm] ?? sub.rhythm },
                      { l: 'Started', v: formatDate(sub.started_at) },
                      { l: 'Managed by', v: sub.stripe_subscription_id ? 'Stripe (automatic billing)' : 'Your mentor' },
                    ].map(({ l, v }) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                        <span style={{ color: 'var(--mute)' }}>{l}</span>
                        <span style={{ color: 'var(--charcoal)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick links */}
              <div className="card">
                <div className="card-title"><h3>Quick links</h3></div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link to="/settings" className="btn btn-ghost btn-sm">Account settings →</Link>
                  <Link to="/sessions" className="btn btn-ghost btn-sm">View sessions →</Link>
                  <Link to="/journal" className="btn btn-ghost btn-sm">Open journal →</Link>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
