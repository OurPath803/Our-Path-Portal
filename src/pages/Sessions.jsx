import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'

const CALENDLY_URL = 'https://calendly.com/hello-ourpathguidance'

function CalendlyEmbed({ url }) {
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

  return (
    <div
      ref={ref}
      className="calendly-inline-widget"
      data-url={`${url}?hide_landing_page_details=1&hide_gdpr_banner=1&primary_color=1a2f36`}
      style={{ minWidth: 320, height: 700, border: 'none' }}
    />
  )
}

export default function Sessions() {
  const { user, profile } = useAuth()
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('sessions')
      .select('*')
      .eq('mentee_id', user.id)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .then(({ data }) => {
        setUpcomingSessions(data ?? [])
        setLoading(false)
      })
  }, [user])

  const rhythm = profile?.rhythm ?? 'fortnightly'

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <CalendlyEmbed url={CALENDLY_URL} />
            </div>

            <div>
              <div className="card">
                <div className="card-title">
                  <h3>Upcoming sessions</h3>
                </div>
                {loading ? (
                  <p className="muted small" style={{ fontStyle: 'italic' }}>Loading…</p>
                ) : upcomingSessions.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--mute)', fontStyle: 'italic' }}>
                    No sessions booked yet. Use the calendar to book your first one.
                  </p>
                ) : (
                  upcomingSessions.map(s => (
                    <div key={s.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--line)' }}>
                      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, color: 'var(--teal)' }}>
                        {formatSessionDate(s.scheduled_at)}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
                        60 minutes · {s.mode ?? 'Video'} · With Shakil
                      </div>
                    </div>
                  ))
                )}
              </div>

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
        </div>
      </div>
    </div>
  )
}
