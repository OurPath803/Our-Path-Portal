import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'

const CALENDLY_URL = 'https://calendly.com/hello-ourpathguidance/1-1-mentoring-session'

function CalendlyEmbed({ url, name, email }) {
  const ref = useRef(null)

  useEffect(() => {
    const existing = document.getElementById('calendly-script')
    if (!existing) {
      const script = document.createElement('script')
      script.id = 'calendly-script'
      script.src = 'https://assets.calendly.com/assets/external/widget.js'
      script.async = true
      document.head.appendChild(script)
    }
  }, [])

  const params = new URLSearchParams({
    hide_landing_page_details: '1',
    hide_gdpr_banner: '1',
    primary_color: '1a2f36',
  })
  if (name) params.set('name', name)
  if (email) params.set('email', email)

  return (
    <div
      ref={ref}
      className="calendly-inline-widget"
      data-url={`${url}?${params.toString()}`}
      style={{ minWidth: 320, height: 700, border: 'none' }}
    />
  )
}

export default function Sessions() {
  const { user, profile } = useAuth()
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase
        .from('sessions')
        .select('*')
        .eq('mentee_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true }),
      supabase
        .from('subscriptions')
        .select('*')
        .eq('mentee_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]).then(([sessionsRes, subRes]) => {
      setUpcomingSessions(sessionsRes.data ?? [])
      setSubscription(subRes.data)
      setLoading(false)
    })
  }, [user])

  const rhythm = subscription?.rhythm ?? 'fortnightly'
  const subscriptionActive = subscription?.status === 'active'

  function formatSessionDate(d) {
    return new Date(d).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div className="journal-head" style={{ marginBottom: 22 }}>
            <div className="eyebrow">
              {rhythm === 'weekly' ? 'Your rhythm includes 4 sessions this month' :
               rhythm === 'fortnightly' ? 'Your rhythm includes 2 sessions this month' :
               'Your rhythm includes 1 session this month'}
            </div>
            <h1>Book your next session with Shakil.</h1>
            <p className="pull">
              Select a date and time that works for you. A confirmation will be sent to your email.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 22 }}>
            <div className="card-title">
              <h3>Upcoming sessions</h3>
            </div>
            {loading ? (
              <p className="muted small" style={{ fontStyle: 'italic' }}>Loading…</p>
            ) : upcomingSessions.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--mute)', fontStyle: 'italic' }}>
                No sessions booked yet.
              </p>
            ) : (
              upcomingSessions.map(s => (
                <div key={s.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--line)' }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, color: 'var(--teal)' }}>
                    {formatSessionDate(s.scheduled_at)}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
                    60 minutes · {s.mode ?? 'video'} · With Shakil
                  </div>
                </div>
              ))
            )}
          </div>

          {!subscriptionActive ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 28px' }}>
              <div className="eyebrow" style={{ textAlign: 'center' }}>Sessions are part of a rhythm</div>
              <h2 style={{
                color: 'var(--teal)',
                fontFamily: 'Fraunces, serif',
                marginBottom: 12,
              }}>
                Choose a rhythm to book sessions
              </h2>
              <p style={{
                fontSize: 15, lineHeight: 1.6, color: 'var(--ink-soft)',
                maxWidth: 480, margin: '0 auto 24px',
              }}>
                Your journal and messaging stay open. To book a session with Shakil,
                pick the cadence that fits the season you're in. Pause or cancel any month.
              </p>
              <Link to="/rhythms" className="btn btn-primary">View rhythms</Link>
            </div>
          ) : (
            <div className="sessions-layout">
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <CalendlyEmbed
                  url={CALENDLY_URL}
                  name={profile?.full_name}
                  email={user?.email}
                />
              </div>

              <div>
                <div className="card" style={{ background: 'var(--cream-deep)', border: 'none' }}>
                  <h4 style={{ color: 'var(--teal)', fontFamily: 'Fraunces, serif', marginBottom: 8 }}>
                    About sessions
                  </h4>
                  <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                    Sessions are 60 minutes via video, phone, or in person in London.
                    A link or details will be sent 30 minutes before we meet.
                  </p>
                  <p style={{ fontSize: 13, marginBottom: 0 }}>
                    If you need to reschedule, please do so at least 24 hours in advance
                    via the confirmation email.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
