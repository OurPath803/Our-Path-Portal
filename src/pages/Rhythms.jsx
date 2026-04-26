import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'

// Vite only inlines `import.meta.env.VITE_*` references that are statically
// referenced. A dynamic key like `import.meta.env[priceKey]` always returns
// `undefined` in production builds. Map the priceKey strings to their
// statically-referenced env var values here.
const PRICE_IDS = {
  VITE_STRIPE_PRICE_MONTHLY: import.meta.env.VITE_STRIPE_PRICE_MONTHLY,
  VITE_STRIPE_PRICE_FORTNIGHTLY: import.meta.env.VITE_STRIPE_PRICE_FORTNIGHTLY,
  VITE_STRIPE_PRICE_WEEKLY: import.meta.env.VITE_STRIPE_PRICE_WEEKLY,
}

const TIERS = [
  {
    name: 'Monthly Rhythm',
    cadence: 'One session per month',
    price: '£39',
    priceKey: 'VITE_STRIPE_PRICE_MONTHLY',
    desc: 'Steady check-in for those already doing the work. Light-touch orientation.',
    features: [
      '1 × 60-minute session / month (video or phone)',
      'Reflective journal · 5-question & freewrite',
      'Between-session messaging (48h weekdays)',
      'Session notes & commitments',
      'Pause or cancel any time',
    ],
    btnClass: 'btn-ghost',
    btnLabel: 'Start monthly rhythm',
  },
  {
    name: 'Fortnightly Rhythm',
    cadence: 'Our standard cadence',
    price: '£75',
    priceKey: 'VITE_STRIPE_PRICE_FORTNIGHTLY',
    desc: 'The rhythm we most often recommend. Enough space to integrate; enough frequency to stay with what matters.',
    features: [
      '2 × 60-minute sessions / month (video, phone or in-person*)',
      'Full reflective journal with prompts and freewrite',
      'Between-session messaging (24h weekdays)',
      'Session notes + commitment tracking',
      'Framework workbooks (Position Map, Cost Audit, Integration Filter)',
      'Pause or cancel any time',
    ],
    btnClass: 'btn-gold',
    btnLabel: 'Start fortnightly rhythm',
    featured: true,
    flag: 'Recommended',
  },
  {
    name: 'Weekly Rhythm',
    cadence: 'Intensive stretch',
    price: '£140',
    priceKey: 'VITE_STRIPE_PRICE_WEEKLY',
    desc: 'For a concentrated season — a decision, a transition, or work that needs close attention.',
    features: [
      '4 × 60-minute sessions / month',
      'Full journal & freewrite',
      'Priority messaging (same day weekdays)',
      'Notes, commitments, all frameworks',
      'One phone check-in per week between sessions',
      'Pause or cancel any time',
    ],
    btnClass: 'btn-ghost',
    btnLabel: 'Start weekly rhythm',
  },
]

export default function Rhythms() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(null)
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('subscriptions')
      .select('*')
      .eq('mentee_id', user.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setSubscription(data))
  }, [user])

  async function startCheckout(priceKey, tierName) {
    if (!user) { window.location.href = '/login'; return }
    setLoading(priceKey)

    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: PRICE_IDS[priceKey],
          userId: user.id,
          email: user.email,
          tierName,
        }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      alert('Something went wrong. Please try again or contact hello@ourpathguidance.co.uk')
    } finally {
      setLoading(null)
    }
  }

  const currentRhythm = subscription?.rhythm
  const isActive = subscription?.status === 'active'

  return (
    <div className="portal-shell">
      {user && <Sidebar />}
      <div className="main-area">
        <div className="rhythm-head">
          <div className="eyebrow">Choose a rhythm · Pause or cancel any month</div>
          <h1>Mentoring is a rhythm, not a transaction.</h1>
          <p>
            Pick the cadence that fits the season you're in. We recommend starting fortnightly —
            enough space to integrate, enough frequency to stay honest.
          </p>
        </div>

        {isActive && currentRhythm && (
          <div style={{
            textAlign: 'center', padding: '16px 40px', background: '#E8F5EE',
            borderBottom: '1px solid var(--line)', fontSize: 14,
            color: 'var(--success)', fontStyle: 'italic', fontFamily: 'Fraunces, serif',
          }}>
            You're currently on the <strong>{currentRhythm}</strong> rhythm. To change or cancel, email{' '}
            <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>
          </div>
        )}

        <div className="tiers">
          {TIERS.map(tier => (
            <div key={tier.name} className={'tier' + (tier.featured ? ' feat' : '')}>
              {tier.flag && <div className="flag">{tier.flag}</div>}
              <h3>{tier.name}</h3>
              <div className="cadence">{tier.cadence}</div>
              <div className="price">{tier.price}<span className="per">/month</span></div>
              <p className="desc">{tier.desc}</p>
              <ul>
                {tier.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <button
                className={'btn ' + tier.btnClass + ' tier-cta'}
                onClick={() => startCheckout(tier.priceKey, tier.name)}
                disabled={loading === tier.priceKey}
              >
                {loading === tier.priceKey ? 'Redirecting…' : tier.btnLabel}
              </button>
            </div>
          ))}
        </div>

        <div className="concession-note">
          <strong>Concession rates available.</strong> OurPath is a CIC — a Community Interest Company.
          If cost is a genuine barrier, write to us at{' '}
          <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>.
          We hold concessionary places at every rhythm for students, those in transition, and low-income mentees.
          No form. No justification essay. Just a short email.
        </div>
      </div>
    </div>
  )
}
