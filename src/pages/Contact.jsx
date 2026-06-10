import { useState } from 'react'
import { Link } from 'react-router-dom'
import MarketingHeader from '../components/MarketingHeader'
import Footer from '../components/Footer'

const SUBJECTS = [
  { value: 'general', label: 'General enquiry' },
  { value: 'workshop', label: 'Workshop enquiry' },
  { value: 'mentoring', label: '1-1 mentoring' },
  { value: 'collaboration', label: 'Collaboration or partnership' },
  { value: 'other', label: 'Other' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact_enquiry',
          to: 'hello@ourpathguidance.co.uk',
          data: form,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg('Something went wrong. Please email us directly at hello@ourpathguidance.co.uk')
    }
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <MarketingHeader />

      <section className="contact-section">
        {/* Left column */}
        <div className="contact-left">
          <div className="eyebrow">Get in Touch</div>
          <h1>We'd like to hear from you.</h1>
          <p>
            Use the form to get in touch about mentoring, workshops, collaborations, or any
            other enquiry. We aim to respond within 48 hours.
          </p>
          <div className="contact-direct">
            <p>Or email us directly</p>
            <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>
          </div>
          <div style={{ marginTop: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Ready to begin?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/referral" className="btn btn-primary btn-sm">Book a Free Conversation</Link>
              <Link to="/triage-call" className="btn btn-ghost btn-sm">Explore Mentoring</Link>
            </div>
          </div>
        </div>

        {/* Right column — form */}
        <div>
          {status === 'success' ? (
            <div className="form-success">
              <h2>Thank you.</h2>
              <p>We'll respond as soon as we can — usually within 48 hours.</p>
            </div>
          ) : (
            <form className="mkt-form" onSubmit={handleSubmit}>
              {status === 'error' && (
                <div className="form-error">{errorMsg}</div>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="name">Name</label>
                <input className="form-input" type="text" id="name" name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input className="form-input" type="email" id="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="subject">Subject</label>
                <select className="form-select" id="subject" name="subject" value={form.subject} onChange={handleChange} required>
                  <option value="">Select a subject</option>
                  {SUBJECTS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea className="form-textarea" id="message" name="message" value={form.message} onChange={handleChange} required rows={6} />
              </div>
              <button type="submit" className="btn btn-gold" disabled={status === 'submitting'} style={{ alignSelf: 'flex-start' }}>
                {status === 'submitting' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
