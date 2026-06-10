import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

// 15-min free triage call. The actual booking happens on Calendly via a new
// event type the user creates at this slug. If you change the slug in
// Calendly, update this constant.
const CALENDLY_URL = 'https://calendly.com/hello-ourpathguidance/triage-call'

function CalendlyEmbed({ url }) {
  const ref = useRef(null)
  useEffect(() => {
    const existing = document.getElementById('calendly-script')
    if (!existing) {
      const s = document.createElement('script')
      s.id = 'calendly-script'
      s.src = 'https://assets.calendly.com/assets/external/widget.js'
      s.async = true
      document.head.appendChild(s)
    }
  }, [])

  const params = new URLSearchParams({
    hide_landing_page_details: '1',
    hide_gdpr_banner: '1',
    primary_color: '1b2b4b',
  })

  return (
    <div
      ref={ref}
      className="calendly-inline-widget"
      data-url={`${url}?${params.toString()}`}
      style={{ minWidth: 320, height: 700, border: 'none' }}
    />
  )
}

export default function TriageCall() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="session-zero">
        {/* Left column — same layout as the old SessionZero left side */}
        <div className="sz-left">
          <div className="eyebrow">Triage call · 15 minutes · No charge</div>
          <h1>A short conversation before any commitment.</h1>
          <p>
            A triage call is a brief mapping conversation with Ustadh Shakil — to understand where
            you are, what you're carrying, and whether mentoring is the right next step. Not a
            sales call.
          </p>
          <p style={{ marginTop: 18 }}>
            If it feels right, we'll book your first paid session. If it doesn't, we'll say so
            plainly and signpost you to whatever might serve you better.
          </p>
          <div className="quote">
            "We don't start with goals. We start with where you actually are."
            <cite>— OurPath</cite>
          </div>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(245,238,217,0.15)' }}>
            <p style={{ color: 'var(--gold-soft)', fontSize: 13, fontStyle: 'italic', marginBottom: 12 }}>
              Don't want to talk on a call?
            </p>
            <p style={{ color: 'rgba(245,238,217,0.82)', fontSize: 14 }}>
              You can also{' '}
              <Link to="/login" style={{ color: 'var(--gold-soft)', borderBottomColor: 'var(--gold-soft)' }}>
                sign up free
              </Link>{' '}
              and start with the journal. No call needed. We're here when you're ready to talk.
            </p>
          </div>
        </div>

        {/* Right column — Calendly embed */}
        <div className="sz-right" style={{ padding: '0', overflow: 'hidden' }}>
          <CalendlyEmbed url={CALENDLY_URL} />
        </div>
      </div>
      <Footer />
    </div>
  )
}
