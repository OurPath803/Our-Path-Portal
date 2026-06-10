import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import MarketingHeader from '../components/MarketingHeader'
import Footer from '../components/Footer'

const AGE_RANGES = ['18–24', '25–29', '30–35', '36+']
const FORMATS    = ['Online (Zoom)', 'In-person (London)', 'No preference']
const FREQUENCIES = ['Weekly', 'Fortnightly', 'Not sure yet']
const SOURCES    = ['Social media', 'Word of mouth', 'Professional referral', 'Event or workshop', 'Search engine', 'Other']

const INITIAL = {
  referral_type: 'self',
  first_name: '', last_name: '', email: '', phone: '',
  age_range: '', location: '',
  current_situation: '', previous_support: '', desired_outcome: '',
  preferred_format: '', preferred_frequency: '', how_heard: '',
  referrer_name: '', referrer_relationship: '',
  consent: false,
}

export default function Referral() {
  const [form, setForm]     = useState(INITIAL)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setError] = useState('')

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.consent) { setError('Please confirm your consent to proceed.'); return }
    setStatus('submitting')
    setError('')

    // Pack extended fields into presenting_concern as structured text
    const presenting_concern = [
      form.current_situation  && `Currently navigating:\n${form.current_situation}`,
      form.previous_support   && `Previous support:\n${form.previous_support}`,
      form.desired_outcome    && `Desired outcome:\n${form.desired_outcome}`,
      form.age_range          && `Age range: ${form.age_range}`,
      form.location           && `Location: ${form.location}`,
    ].filter(Boolean).join('\n\n')

    const referral_source = [
      form.referral_type !== 'self' ? `Type: ${form.referral_type}` : 'Self-referral',
      form.how_heard && `Source: ${form.how_heard}`,
      form.referrer_name && `Referred by: ${form.referrer_name} (${form.referrer_relationship})`,
    ].filter(Boolean).join(' · ')

    const { error: dbError } = await supabase.from('applications').insert({
      full_name:          `${form.first_name} ${form.last_name}`.trim(),
      email:              form.email,
      phone:              form.phone || null,
      referral_source:    referral_source || 'Not specified',
      presenting_concern: presenting_concern || null,
      preferred_days:     form.preferred_frequency || null,
      consent_given:      true,
      status:             'pending',
    })

    if (dbError) {
      setStatus('error')
      setError('Something went wrong saving your referral. Please email us at hello@ourpathguidance.co.uk')
      return
    }

    // Notify admin — fire-and-forget, don't block user on email failure
    fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'new_application',
        to:   'hello@ourpathguidance.co.uk',
        data: {
          name:             `${form.first_name} ${form.last_name}`.trim(),
          email:            form.email,
          motivation:       presenting_concern,
          preferred_rhythm: form.preferred_frequency,
          preferred_mode:   form.preferred_format,
        },
      }),
    }).catch(() => {})

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
        <MarketingHeader />
        <div style={{ padding: '80px 48px', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div className="form-success">
            <h2>Thank you for your referral.</h2>
            <p>We'll be in touch within 48 hours to arrange your screening conversation.</p>
          </div>
          <div style={{ marginTop: 32 }}>
            <Link to="/" className="btn btn-ghost btn-sm">Return home</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <MarketingHeader />

      <section className="referral-hero">
        <div className="eyebrow">Referral &amp; Session Zero Intake</div>
        <h1>Begin your development here.</h1>
        <p>
          Whether you're referring yourself or someone else, this form gives us the information
          we need to prepare for your first conversation. Everything you share is confidential.
        </p>
      </section>

      <section className="referral-form-section">
        {/* Sidebar */}
        <div className="referral-sidebar">
          <h2>Prefer to talk first?</h2>
          <p>
            If you'd rather speak with us before filling in the form, book a free
            20-minute call instead.
          </p>
          <Link to="/triage-call" className="btn btn-primary btn-sm">Book a Call</Link>
          <div className="contact-direct" style={{ marginTop: 24 }}>
            <p>Or email us directly</p>
            <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>
          </div>
          <p style={{ marginTop: 24, fontSize: 13, color: 'var(--mute)', lineHeight: 1.6 }}>
            OurPath is non-clinical developmental mentoring — not therapy or medical treatment.
          </p>
        </div>

        {/* Form */}
        <form className="mkt-form" onSubmit={handleSubmit}>
          {errorMsg && <div className="form-error">{errorMsg}</div>}

          {/* Referral type */}
          <p className="form-section-title">Referral Type</p>
          <div className="form-group">
            <label className="form-label">Are you referring yourself or someone else?</label>
            {[
              { value: 'self',         label: 'Self-referral' },
              { value: 'referred',     label: 'Referred by someone else' },
              { value: 'professional', label: 'Professional referral (GP, social worker, etc.)' },
            ].map(opt => (
              <label key={opt.value} style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, fontSize: 15, color: 'var(--charcoal)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                <input type="radio" name="referral_type" value={opt.value} checked={form.referral_type === opt.value} onChange={handleChange} style={{ accentColor: 'var(--navy)', flexShrink: 0 }} />
                {opt.label}
              </label>
            ))}
          </div>

          {/* Personal Details */}
          <p className="form-section-title">Personal Details</p>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="first_name">First Name</label>
              <input className="form-input" type="text" id="first_name" name="first_name" value={form.first_name} onChange={handleChange} required autoComplete="given-name" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="last_name">Last Name</label>
              <input className="form-input" type="text" id="last_name" name="last_name" value={form.last_name} onChange={handleChange} required autoComplete="family-name" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input className="form-input" type="email" id="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--mute)', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input className="form-input" type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="age_range">Age Range</label>
              <select className="form-select" id="age_range" name="age_range" value={form.age_range} onChange={handleChange}>
                <option value="">Select</option>
                {AGE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="location">Location</label>
              <input className="form-input" type="text" id="location" name="location" value={form.location} onChange={handleChange} placeholder="City or area" />
            </div>
          </div>

          {/* Context */}
          <p className="form-section-title">Your Context</p>
          <div className="form-group">
            <label className="form-label" htmlFor="current_situation">What are you currently navigating?</label>
            <textarea className="form-textarea" id="current_situation" name="current_situation" value={form.current_situation} onChange={handleChange} rows={4} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="previous_support">
              Have you tried any support before?{' '}
              <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--mute)', letterSpacing: 0 }}>(therapy, coaching, mentoring, etc.)</span>
            </label>
            <textarea className="form-textarea" id="previous_support" name="previous_support" value={form.previous_support} onChange={handleChange} rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="desired_outcome">What would a helpful outcome look like for you?</label>
            <textarea className="form-textarea" id="desired_outcome" name="desired_outcome" value={form.desired_outcome} onChange={handleChange} rows={3} />
          </div>

          {/* Preferences */}
          <p className="form-section-title">Preferences</p>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="preferred_format">Preferred Format</label>
              <select className="form-select" id="preferred_format" name="preferred_format" value={form.preferred_format} onChange={handleChange}>
                <option value="">Select</option>
                {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="preferred_frequency">Preferred Frequency</label>
              <select className="form-select" id="preferred_frequency" name="preferred_frequency" value={form.preferred_frequency} onChange={handleChange}>
                <option value="">Select</option>
                {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="how_heard">How did you hear about OurPath?</label>
            <select className="form-select" id="how_heard" name="how_heard" value={form.how_heard} onChange={handleChange}>
              <option value="">Select</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Referrer details — only when not self-referral */}
          {form.referral_type !== 'self' && (
            <>
              <p className="form-section-title">Referrer Details</p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="referrer_name">Referrer Name</label>
                  <input className="form-input" type="text" id="referrer_name" name="referrer_name" value={form.referrer_name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="referrer_relationship">Relationship</label>
                  <input className="form-input" type="text" id="referrer_relationship" name="referrer_relationship" value={form.referrer_relationship} onChange={handleChange} placeholder="e.g. GP, friend, colleague" />
                </div>
              </div>
            </>
          )}

          {/* Consent */}
          <label className="consent-label">
            <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} />
            I understand that OurPath is a personal development service offering developmental
            guidance and mentoring, not therapy or clinical intervention. I consent to my
            information being stored securely and used to prepare for my screening conversation
            and sessions.
          </label>

          <button type="submit" className="btn btn-primary" disabled={status === 'submitting'} style={{ alignSelf: 'flex-start' }}>
            {status === 'submitting' ? 'Submitting…' : 'Submit Referral →'}
          </button>
        </form>
      </section>

      <Footer />
    </div>
  )
}
