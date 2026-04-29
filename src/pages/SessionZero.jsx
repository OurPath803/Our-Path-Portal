import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const RHYTHM_OPTIONS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Fortnightly', value: 'fortnightly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Unsure — let\'s discuss', value: 'unsure' },
]

const MODE_OPTIONS = [
  { label: 'Video', value: 'video' },
  { label: 'Phone', value: 'phone' },
  { label: 'In person (London)', value: 'in_person' },
]

export default function SessionZero() {
  const [form, setForm] = useState({
    name: '', email: '', motivation: '',
    rhythm: 'fortnightly', mode: 'video',
    consent: false,
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.consent) {
      setError('Please confirm you understand this creates a record in our system.')
      return
    }
    setLoading(true)

    const { error } = await supabase.from('applications').insert({
      applicant_name: form.name,
      email: form.email,
      reason_for_support: form.motivation,
      preferred_rhythm: form.rhythm,
      preferred_mode: form.mode,
      consent: form.consent,
      // status defaults to 'new'
    })

    if (error) {
      setError('Something went wrong. Please try again or email hello@ourpathguidance.co.uk')
    } else {
      setSubmitted(true)
      // Notify admin (best effort) AND auto-reply to applicant.
      const sendEmail = (payload) => fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {})

      sendEmail({
        type: 'new_application',
        to: form.email, // routed to admin server-side
        data: {
          name: form.name,
          email: form.email,
          motivation: form.motivation,
          preferred_rhythm: form.rhythm,
          preferred_mode: form.mode,
        },
      })
      sendEmail({
        type: 'application_received',
        to: form.email,
        data: { name: form.name },
      })
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 520, textAlign: 'center', padding: 48 }}>
          <div className="eyebrow" style={{ textAlign: 'center' }}>Thank you</div>
          <h1 style={{ color: 'var(--teal)', fontFamily: 'Fraunces, serif' }}>
            You're on the waiting list.
          </h1>
          <p style={{
            fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18,
            lineHeight: 1.6, color: 'var(--ink-soft)', marginBottom: 32,
          }}>
            Shakil reviews each application personally. We'll be in touch within 48 hours.
          </p>
          <Link to="/" className="btn btn-ghost">Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="session-zero">
        <div className="sz-left">
          <div className="eyebrow">Session Zero · 20 minutes · No charge</div>
          <h1>A short conversation before any commitment.</h1>
          <p>
            Session Zero isn't a sales call. It's a short mapping conversation — to understand where
            you are, what you're carrying, and whether this work is right for you now. If it isn't,
            we'll say so plainly.
          </p>
          <p style={{ marginTop: 18 }}>
            You'll speak with a mentor. Currently that's Shakil. If it feels right after, we'll set
            a rhythm. If it doesn't, that's also fine.
          </p>
          <div className="quote">
            "We don't start with goals. We start with where you actually are — which is often the
            part that's been avoided."
            <cite>— OurPath Mentoring Handbook</cite>
          </div>
        </div>

        <div className="sz-right">
          <h2>Request Session Zero</h2>
          <p className="sub">Takes about three minutes. Nothing is shared outside OurPath.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-row">
              <label>What's drawing you here, in your own words?</label>
              <textarea
                style={{ minHeight: 100 }}
                value={form.motivation}
                onChange={e => set('motivation', e.target.value)}
                placeholder="No need for a tidy answer. First draft is fine."
              />
              <div className="hint">No need for a tidy answer. First draft is fine.</div>
            </div>
            <div className="form-row">
              <label>What rhythm feels right to start with?</label>
              <div className="choices">
                {RHYTHM_OPTIONS.map(r => (
                  <div
                    key={r.value}
                    className={'choice' + (form.rhythm === r.value ? ' active' : '')}
                    onClick={() => set('rhythm', r.value)}
                  >
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-row">
              <label>Preferred mode</label>
              <div className="choices">
                {MODE_OPTIONS.map(m => (
                  <div
                    key={m.value}
                    className={'choice' + (form.mode === m.value ? ' active' : '')}
                    onClick={() => set('mode', m.value)}
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-row">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={e => set('consent', e.target.checked)}
                />
                <span className="check-text">
                  I understand this creates a record in OurPath's system, used only to follow up
                  with me about Session Zero. I've read the{' '}
                  <a href="/privacy" target="_blank" rel="noreferrer">privacy policy</a>{' '}
                  and the{' '}
                  <a href="/terms" target="_blank" rel="noreferrer">terms of service</a>.
                </span>
              </label>
            </div>
            <div className="form-footer">
              <div className="meta">
                We'll be in touch within 48 hours.
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
