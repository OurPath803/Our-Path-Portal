/**
 * Settings — tabbed account management for mentees.
 *
 * Tabs: Account · Appearance · Notifications · Subscription
 *
 * Account:      display name, email change, password change
 * Appearance:   theme selector (persisted via lib/theme.js)
 * Notifications: email preference toggles (persisted to Supabase profiles)
 * Subscription: current status + cancel option
 */
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { useTheme, THEMES } from '../lib/theme'

const TABS = ['Account', 'Appearance', 'Notifications', 'Subscription']

// Tiny preview swatches for each theme.
const PREVIEWS = {
  cream:  { bg: '#FAFAF8', card: '#FAF7F0', accent: '#C9A84C', text: '#1E3A5F' },
  night:  { bg: '#0E1A1F', card: '#1A2A30', accent: '#C9A84C', text: '#E8EFE8' },
  sand:   { bg: '#EDE3CC', card: '#FFF4DB', accent: '#B8884F', text: '#1E3A5F' },
  forest: { bg: '#EBEEDD', card: '#F8FAEC', accent: '#8B7E3E', text: '#142B30' },
}

// ── Tab button ────────────────────────────────────────────────────────────────
function Tab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '10px 20px', fontSize: 14, background: 'transparent',
        color: active ? 'var(--navy)' : 'var(--mute)',
        borderBottom: active ? '2px solid var(--navy)' : '2px solid transparent',
        fontWeight: active ? 500 : 400,
        marginBottom: -1, cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        transition: 'color 0.12s',
      }}
    >
      {label}
    </button>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Flash({ msg, error }) {
  if (!msg) return null
  return (
    <div className={error ? 'auth-error' : 'auth-success'} style={{ marginBottom: 16 }}>
      {msg}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
      color: 'var(--gold)', fontWeight: 600, marginBottom: 16,
      paddingBottom: 10, borderBottom: '1px solid var(--line)',
    }}>
      {children}
    </div>
  )
}

// ── Account tab ───────────────────────────────────────────────────────────────
function AccountTab({ user, profile }) {
  const [name, setName] = useState(profile?.full_name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [nameFlash, setNameFlash] = useState('')

  const [newEmail, setNewEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const [emailFlash, setEmailFlash] = useState({ msg: '', error: false })

  const [currPw, setCurrPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwFlash, setPwFlash] = useState({ msg: '', error: false })

  useEffect(() => {
    if (profile?.full_name) setName(profile.full_name)
  }, [profile?.full_name])

  async function saveName(e) {
    e.preventDefault()
    setSavingName(true)
    const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', user.id)
    setSavingName(false)
    setNameFlash(error ? `Error: ${error.message}` : 'Name updated.')
    setTimeout(() => setNameFlash(''), 4000)
  }

  async function saveEmail(e) {
    e.preventDefault()
    if (!newEmail || !newEmail.includes('@')) {
      setEmailFlash({ msg: 'Enter a valid email address.', error: true })
      return
    }
    setSavingEmail(true)
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    setSavingEmail(false)
    if (error) {
      setEmailFlash({ msg: `Error: ${error.message}`, error: true })
    } else {
      setEmailFlash({ msg: 'Check both inboxes — a confirmation link has been sent to your new address.', error: false })
      setNewEmail('')
    }
    setTimeout(() => setEmailFlash({ msg: '', error: false }), 8000)
  }

  async function savePassword(e) {
    e.preventDefault()
    if (newPw.length < 8) {
      setPwFlash({ msg: 'Password must be at least 8 characters.', error: true })
      return
    }
    if (newPw !== confirmPw) {
      setPwFlash({ msg: 'Passwords do not match.', error: true })
      return
    }
    setSavingPw(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setSavingPw(false)
    if (error) {
      setPwFlash({ msg: `Error: ${error.message}`, error: true })
    } else {
      setPwFlash({ msg: 'Password updated.', error: false })
      setCurrPw(''); setNewPw(''); setConfirmPw('')
    }
    setTimeout(() => setPwFlash({ msg: '', error: false }), 5000)
  }

  return (
    <div style={{ maxWidth: 580 }}>

      {/* Display name */}
      <div className="card" style={{ marginBottom: 20 }}>
        <SectionTitle>Display name</SectionTitle>
        <form onSubmit={saveName}>
          <div className="form-row">
            <label>Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>
          {nameFlash && (
            <div className={nameFlash.startsWith('Error') ? 'auth-error' : 'auth-success'} style={{ marginBottom: 12 }}>
              {nameFlash}
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-sm" disabled={savingName}>
            {savingName ? 'Saving…' : 'Save name'}
          </button>
        </form>
      </div>

      {/* Email */}
      <div className="card" style={{ marginBottom: 20 }}>
        <SectionTitle>Email address</SectionTitle>
        <div className="form-row" style={{ marginBottom: 16 }}>
          <label>Current email</label>
          <input type="email" value={user?.email ?? ''} disabled style={{ opacity: 0.6 }} />
        </div>
        <form onSubmit={saveEmail}>
          <div className="form-row">
            <label>New email address</label>
            <input
              type="email" value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="new@example.com"
            />
            <div className="hint">
              A confirmation link will be sent to the new address. Your email won't
              change until you click the link.
            </div>
          </div>
          <Flash msg={emailFlash.msg} error={emailFlash.error} />
          <button type="submit" className="btn btn-primary btn-sm" disabled={savingEmail || !newEmail}>
            {savingEmail ? 'Sending…' : 'Send confirmation'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card">
        <SectionTitle>Password</SectionTitle>
        <form onSubmit={savePassword}>
          <div className="form-row">
            <label>New password</label>
            <input
              type="password" value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
          </div>
          <div className="form-row">
            <label>Confirm new password</label>
            <input
              type="password" value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </div>
          <Flash msg={pwFlash.msg} error={pwFlash.error} />
          <button type="submit" className="btn btn-primary btn-sm" disabled={savingPw || !newPw}>
            {savingPw ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>

    </div>
  )
}

// ── Appearance tab ────────────────────────────────────────────────────────────
function AppearanceTab() {
  const [theme, setTheme] = useTheme()

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="card">
        <SectionTitle>Portal theme</SectionTitle>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 20 }}>
          Pick the palette that's easiest on your eyes. Saved on this device.
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12,
        }}>
          {THEMES.map(t => {
            const p = PREVIEWS[t.id]
            const active = theme === t.id
            return (
              <button
                key={t.id} type="button"
                onClick={() => setTheme(t.id)}
                style={{
                  display: 'block', padding: 12, cursor: 'pointer',
                  border: active ? '2px solid var(--gold)' : '1px solid var(--line)',
                  borderRadius: 6, background: 'transparent',
                  textAlign: 'left', transition: 'all 0.12s',
                }}
              >
                {/* Swatch */}
                <div style={{
                  display: 'flex', height: 56, borderRadius: 4,
                  overflow: 'hidden', border: '1px solid var(--line)', marginBottom: 10,
                }}>
                  <div style={{ flex: 1, background: p.bg }} />
                  <div style={{ flex: 1, background: p.card, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 4, background: p.text, borderRadius: 2 }} />
                    <div style={{ position: 'absolute', top: 18, left: 8, width: 36, height: 3, background: p.text, opacity: 0.5, borderRadius: 2 }} />
                    <div style={{ position: 'absolute', bottom: 8, left: 8, width: 12, height: 12, background: p.accent, borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'var(--navy)', fontWeight: 500 }}>
                    {t.label}
                  </span>
                  {active && (
                    <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}>
                      Active
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.4 }}>{t.description}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Notifications tab ─────────────────────────────────────────────────────────
const NOTIF_DEFAULTS = {
  session_reminders: true,
  session_confirmations: true,
  journal_prompts: false,
  newsletter: false,
}

const NOTIF_OPTIONS = [
  { key: 'session_reminders',    label: 'Session reminders',    hint: 'Email 24 hours before each scheduled session.' },
  { key: 'session_confirmations', label: 'Session confirmations', hint: 'Confirmation when a session is booked or cancelled.' },
  { key: 'journal_prompts',      label: 'Weekly journal prompt', hint: 'A short question to your inbox each week.' },
  { key: 'newsletter',           label: 'OurPath updates',       hint: 'Occasional news about new workshops and resources.' },
]

function NotificationsTab({ user }) {
  const [prefs, setPrefs] = useState(NOTIF_DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('notification_prefs')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.notification_prefs) {
          setPrefs({ ...NOTIF_DEFAULTS, ...data.notification_prefs })
        }
        setLoaded(true)
      })
  }, [user?.id])

  function toggle(key) {
    setPrefs(p => ({ ...p, [key]: !p[key] }))
  }

  async function save() {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ notification_prefs: prefs })
      .eq('id', user.id)
    setSaving(false)
    setFlash(error ? `Error: ${error.message}` : 'Preferences saved.')
    setTimeout(() => setFlash(''), 4000)
  }

  if (!loaded) return <div className="loading">Loading…</div>

  return (
    <div style={{ maxWidth: 520 }}>
      <div className="card">
        <SectionTitle>Email notifications</SectionTitle>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 20 }}>
          Control what OurPath sends to {user?.email}.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {NOTIF_OPTIONS.map(opt => (
            <label
              key={opt.key}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', gap: 16 }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--navy)', marginBottom: 2 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: 'var(--mute)' }}>{opt.hint}</div>
              </div>
              <div
                onClick={() => toggle(opt.key)}
                style={{
                  flexShrink: 0,
                  width: 40, height: 22, borderRadius: 11,
                  background: prefs[opt.key] ? 'var(--navy)' : 'var(--line)',
                  position: 'relative', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3,
                  left: prefs[opt.key] ? 21 : 3,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
            </label>
          ))}
        </div>
        {flash && (
          <div className={flash.startsWith('Error') ? 'auth-error' : 'auth-success'} style={{ marginBottom: 12 }}>
            {flash}
          </div>
        )}
        <button type="button" className="btn btn-primary btn-sm" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save preferences'}
        </button>
      </div>
    </div>
  )
}

// ── Subscription tab ──────────────────────────────────────────────────────────
function SubscriptionTab({ user, profile }) {
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [flash, setFlash] = useState({ msg: '', error: false })

  useEffect(() => {
    if (!user) return
    supabase
      .from('subscriptions')
      .select('*')
      .eq('mentee_id', user.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setSub(data)
        setLoading(false)
      })
  }, [user?.id])

  async function cancelSubscription() {
    if (!window.confirm(
      'Are you sure you want to cancel your subscription? Your mentor will be notified. ' +
      'You can reactivate at any time by getting in touch.'
    )) return

    setCancelling(true)
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', sub.id)

    if (error) {
      setFlash({ msg: `Error: ${error.message}`, error: true })
      setCancelling(false)
      return
    }

    // Send cancellation email
    fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'subscription_cancelled',
        to: user.email,
        data: {
          name: profile?.full_name || 'there',
          rhythm: sub.rhythm,
        },
      }),
    }).catch(() => {})

    setSub(s => ({ ...s, status: 'cancelled' }))
    setCancelling(false)
    setFlash({ msg: 'Subscription cancelled. Your mentor has been notified.', error: false })
  }

  const STATUS_LABEL = { active: 'Active', paused: 'Paused', cancelled: 'Cancelled' }
  const STATUS_COLOR = {
    active: { bg: 'rgba(39,174,96,0.08)', color: 'var(--success)', border: 'rgba(39,174,96,0.2)' },
    paused: { bg: 'var(--cream-deep)', color: 'var(--mute)', border: 'var(--line)' },
    cancelled: { bg: 'rgba(192,57,43,0.06)', color: 'var(--danger)', border: 'rgba(192,57,43,0.2)' },
  }

  const s = sub?.status && STATUS_COLOR[sub.status] ? STATUS_COLOR[sub.status] : STATUS_COLOR.paused

  return (
    <div style={{ maxWidth: 520 }}>
      {loading ? (
        <div className="loading">Loading…</div>
      ) : !sub ? (
        <div className="card">
          <SectionTitle>Subscription</SectionTitle>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
            No active subscription found. If you believe this is an error, get in touch
            at <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>.
          </p>
        </div>
      ) : (
        <div className="card">
          <SectionTitle>Your subscription</SectionTitle>

          {/* Status */}
          <div style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 4,
            background: s.bg, color: s.color,
            border: `1px solid ${s.border}`,
            fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
            fontWeight: 600, marginBottom: 20,
          }}>
            {STATUS_LABEL[sub.status] ?? sub.status}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {[
              { l: 'Session rhythm', v: sub.rhythm ? sub.rhythm.charAt(0).toUpperCase() + sub.rhythm.slice(1) : '—' },
              { l: 'Started', v: sub.started_at ? new Date(sub.started_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
              { l: 'Managed via', v: sub.stripe_subscription_id ? 'Stripe' : 'Manual' },
            ].map(({ l, v }) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--mute)' }}>{l}</span>
                <span style={{ color: 'var(--charcoal)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          <Flash msg={flash.msg} error={flash.error} />

          {sub.status === 'active' && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14, fontStyle: 'italic' }}>
                Cancelling will stop new sessions from being scheduled. You won't lose
                access to previous session notes or your journal.
              </p>
              <button
                type="button"
                className="btn btn-sm"
                disabled={cancelling}
                onClick={cancelSubscription}
                style={{
                  background: 'transparent', color: 'var(--danger)',
                  border: '1px solid var(--danger)', padding: '7px 14px',
                  fontSize: 13,
                }}
              >
                {cancelling ? 'Cancelling…' : 'Cancel subscription'}
              </button>
            </div>
          )}

          {sub.status === 'cancelled' && (
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
              Subscription is cancelled. To reactivate, email{' '}
              <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>.
            </p>
          )}

          {sub.status === 'paused' && (
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
              Subscription is paused. Contact your mentor to reactivate.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Settings() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState('Account')

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div className="journal-head">
            <h1>Settings</h1>
            <p className="pull">Your account and portal preferences.</p>
          </div>

          {/* Tab bar */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--line)',
            marginBottom: 28, gap: 0,
          }}>
            {TABS.map(t => (
              <Tab key={t} label={t} active={tab === t} onClick={() => setTab(t)} />
            ))}
          </div>

          {tab === 'Account'       && <AccountTab user={user} profile={profile} />}
          {tab === 'Appearance'    && <AppearanceTab />}
          {tab === 'Notifications' && <NotificationsTab user={user} />}
          {tab === 'Subscription'  && <SubscriptionTab user={user} profile={profile} />}
        </div>
      </div>
    </div>
  )
}
