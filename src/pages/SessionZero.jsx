import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const RHYTHMS = ['Monthly', 'Fortnightly', 'Weekly', 'Unsure — let\'s discuss']
const MODES = ['Video', 'Phone', 'In person (London)']

export default function SessionZero() {
  const [form, setForm] = useState({
    name: '', email: '', motivation: '',
    rhythm: 'Fortnightly', mode: 'Video',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.from('applications').insert({
      name: form.name,
      email: form.email,
      motivation: form.motivation,
      preferred_rhythm: form.rhythm,
      preferred_mode: form.mode,
    })

    if (error) {
      setError('Something went wrong. Please try again or email hello@ourpathguidance.co.uk')
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 480, textAlign: 'center', padding: 48 }}>
          <div className="eyebrow" style={{ textAlign: 'center' }}>Thank you</div>
          <h1 style={{ color: 'var(--teal)' }}>Your request has been received.</h1>
          <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 17, lineHeight: 1.6, color: 'var(--ink-soft)', marginBottom: 32 }}>
            We'll be in touch within 48 hours to arrange a time that works.
            Nothing is decided yet — this is just a conversation.
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
                {RHYTHMS.map(r => (
                  <div
                    key={r}
                    className={'choice' + (form.rhythm === r ? ' active' : '')}
                    onClick={() => set('rhythm', r)}
                  >
                    {r}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-row">
              <label>Preferred mode</label>
              <div className="choices">
                {MODES.map(m => (
                  <div
                    key={m}
                    className={'choice' + (form.mode === m ? ' active' : '')}
                    onClick={() => set('mode', m)}
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-footer">
              <div className="meta">
                This creates a referral in our system.<br />
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
