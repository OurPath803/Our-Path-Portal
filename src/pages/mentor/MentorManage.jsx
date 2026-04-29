import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const RHYTHM_OPTIONS = [
  { value: 'monthly', label: 'Monthly (1×/month)' },
  { value: 'fortnightly', label: 'Fortnightly (2×/month)' },
  { value: 'weekly', label: 'Weekly (4×/month)' },
]

const SUBSCRIPTION_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
]

const MODE_OPTIONS = [
  { value: 'video', label: 'Video' },
  { value: 'phone', label: 'Phone' },
  { value: 'in_person', label: 'In person' },
]

const SESSION_STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No-show' },
]

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// HTML datetime-local input expects "YYYY-MM-DDTHH:mm" in local time.
function toDatetimeLocal(d) {
  const date = new Date(d)
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function defaultSessionTime() {
  // Tomorrow at 10am local — sensible default.
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(10, 0, 0, 0)
  return toDatetimeLocal(d)
}

export default function MentorManage() {
  const { menteeId } = useParams()
  const { user } = useAuth()

  const [mentee, setMentee] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Subscription form state
  const [subForm, setSubForm] = useState({ rhythm: 'fortnightly', status: 'active' })
  const [savingSub, setSavingSub] = useState(false)
  const [subFlash, setSubFlash] = useState('')

  // Session form state
  const [sesForm, setSesForm] = useState({
    scheduled_at: defaultSessionTime(),
    duration_mins: 60,
    mode: 'video',
    status: 'scheduled',
  })
  const [savingSes, setSavingSes] = useState(false)
  const [sesFlash, setSesFlash] = useState('')

  useEffect(() => {
    if (!user || !menteeId) return
    load()
  }, [user, menteeId])

  async function load() {
    setLoading(true)
    setError('')

    const [menteeRes, subRes, sesRes] = await Promise.all([
      supabase.from('profiles')
        .select('id, full_name, email, role::text, mentor_id')
        .eq('id', menteeId).maybeSingle(),
      supabase.from('subscriptions')
        .select('*').eq('mentee_id', menteeId)
        .order('started_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('sessions')
        .select('*').eq('mentee_id', menteeId)
        .order('scheduled_at', { ascending: false }),
    ])

    if (menteeRes.error || !menteeRes.data) {
      setError('Mentee not found, or you don\'t have access.')
      setLoading(false)
      return
    }

    setMentee(menteeRes.data)
    setSubscription(subRes.data)
    setSessions(sesRes.data ?? [])
    if (subRes.data) {
      setSubForm({ rhythm: subRes.data.rhythm, status: subRes.data.status })
    }
    setLoading(false)
  }

  async function saveSubscription(e) {
    e.preventDefault()
    setSavingSub(true)
    setSubFlash('')

    if (subscription) {
      // Update existing
      const { error } = await supabase
        .from('subscriptions')
        .update({ rhythm: subForm.rhythm, status: subForm.status })
        .eq('id', subscription.id)
      if (error) {
        setSubFlash(`Save failed: ${error.message}`)
      } else {
        setSubFlash('Subscription updated.')
        await load()
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          mentee_id: menteeId,
          rhythm: subForm.rhythm,
          status: subForm.status,
        })
      if (error) {
        setSubFlash(`Save failed: ${error.message}`)
      } else {
        setSubFlash('Subscription created — mentee can now book sessions.')
        await load()
      }
    }
    setSavingSub(false)
    setTimeout(() => setSubFlash(''), 4000)
  }

  async function addSession(e) {
    e.preventDefault()
    setSavingSes(true)
    setSesFlash('')

    const { error } = await supabase.from('sessions').insert({
      mentee_id: menteeId,
      mentor_id: user.id,
      scheduled_at: new Date(sesForm.scheduled_at).toISOString(),
      duration_mins: Number(sesForm.duration_mins) || 60,
      mode: sesForm.mode,
      status: sesForm.status,
    })

    if (error) {
      setSesFlash(`Save failed: ${error.message}`)
    } else {
      setSesFlash('Session added.')
      // Reset form, reload
      setSesForm({
        scheduled_at: defaultSessionTime(),
        duration_mins: 60,
        mode: 'video',
        status: 'scheduled',
      })
      await load()
    }
    setSavingSes(false)
    setTimeout(() => setSesFlash(''), 4000)
  }

  async function cancelSession(id) {
    if (!confirm('Cancel this session? It will be marked cancelled, not deleted.')) return
    await supabase.from('sessions').update({ status: 'cancelled' }).eq('id', id)
    await load()
  }

  async function deleteSession(id) {
    if (!confirm('Delete this session row entirely? This cannot be undone.')) return
    await supabase.from('sessions').delete().eq('id', id)
    await load()
  }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div style={{ marginBottom: 12 }}>
            <Link to="/mentor" style={{ fontSize: 13 }}>← All mentees</Link>
          </div>

          {loading ? (
            <div className="loading">Loading…</div>
          ) : error ? (
            <div className="auth-error">{error}</div>
          ) : (
            <>
              <div className="journal-head">
                <div className="eyebrow">Manage · {mentee?.full_name ?? mentee?.email}</div>
                <h1>Concierge controls</h1>
                <p className="pull">
                  Use these for comp rates, friends-and-family access, mentees who paid outside
                  of Stripe, or to backfill sessions you had before the portal existed.
                </p>
              </div>

              <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* ──────────────── Subscription panel ──────────────── */}
                <div className="card">
                  <div className="card-title">
                    <h3>Subscription</h3>
                    {subscription && (
                      <span className="tag" style={{
                        background: subscription.status === 'active' ? '#E8F5EE' : 'var(--cream-deep)',
                        color: subscription.status === 'active' ? 'var(--success)' : 'var(--mute)',
                      }}>
                        {subscription.status}
                      </span>
                    )}
                  </div>

                  {subscription ? (
                    <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 16 }}>
                      Currently <strong>{subscription.rhythm}</strong>, status{' '}
                      <strong>{subscription.status}</strong>
                      {subscription.stripe_subscription_id
                        ? ' (Stripe-managed)'
                        : ' (manually managed)'}.
                      Started {formatDate(subscription.started_at)}.
                    </p>
                  ) : (
                    <p style={{ fontSize: 14, color: 'var(--mute)', fontStyle: 'italic', marginBottom: 16 }}>
                      No subscription yet. Creating one here grants the mentee access to book
                      sessions without going through Stripe checkout.
                    </p>
                  )}

                  {subFlash && (
                    <div className={subFlash.includes('failed') ? 'auth-error' : 'auth-success'}>
                      {subFlash}
                    </div>
                  )}

                  <form onSubmit={saveSubscription}>
                    <div className="form-row">
                      <label>Rhythm</label>
                      <select
                        value={subForm.rhythm}
                        onChange={e => setSubForm(f => ({ ...f, rhythm: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 12px',
                          border: '1px solid var(--line)', borderRadius: 4,
                          background: 'var(--cream)', color: 'var(--teal)',
                          fontFamily: 'inherit', fontSize: 14,
                        }}
                      >
                        {RHYTHM_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Status</label>
                      <select
                        value={subForm.status}
                        onChange={e => setSubForm(f => ({ ...f, status: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 12px',
                          border: '1px solid var(--line)', borderRadius: 4,
                          background: 'var(--cream)', color: 'var(--teal)',
                          fontFamily: 'inherit', fontSize: 14,
                        }}
                      >
                        {SUBSCRIPTION_STATUSES.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <div className="hint">
                        Setting status to "Active" with any rhythm immediately unlocks Calendly
                        booking for them.
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={savingSub}
                    >
                      {savingSub ? 'Saving…' : subscription ? 'Update subscription' : 'Create subscription'}
                    </button>
                  </form>
                </div>

                {/* ──────────────── Sessions panel ──────────────── */}
                <div className="card">
                  <div className="card-title">
                    <h3>Sessions</h3>
                    <span className="tag">{sessions.length} total</span>
                  </div>

                  {sesFlash && (
                    <div className={sesFlash.includes('failed') ? 'auth-error' : 'auth-success'}>
                      {sesFlash}
                    </div>
                  )}

                  <form onSubmit={addSession} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 13, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 500 }}>
                      Add a session
                    </div>
                    <div className="form-row">
                      <label>When</label>
                      <input
                        type="datetime-local"
                        value={sesForm.scheduled_at}
                        onChange={e => setSesForm(f => ({ ...f, scheduled_at: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label>Duration (minutes)</label>
                      <input
                        type="number"
                        min="15"
                        max="240"
                        value={sesForm.duration_mins}
                        onChange={e => setSesForm(f => ({ ...f, duration_mins: e.target.value }))}
                      />
                    </div>
                    <div className="form-row">
                      <label>Mode</label>
                      <select
                        value={sesForm.mode}
                        onChange={e => setSesForm(f => ({ ...f, mode: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 12px',
                          border: '1px solid var(--line)', borderRadius: 4,
                          background: 'var(--cream)', color: 'var(--teal)',
                          fontFamily: 'inherit', fontSize: 14,
                        }}
                      >
                        {MODE_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Status</label>
                      <select
                        value={sesForm.status}
                        onChange={e => setSesForm(f => ({ ...f, status: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 12px',
                          border: '1px solid var(--line)', borderRadius: 4,
                          background: 'var(--cream)', color: 'var(--teal)',
                          fontFamily: 'inherit', fontSize: 14,
                        }}
                      >
                        {SESSION_STATUSES.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <div className="hint">
                        Use "Completed" to backfill historical sessions.
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={savingSes}
                    >
                      {savingSes ? 'Saving…' : 'Add session'}
                    </button>
                  </form>

                  <div style={{ fontSize: 13, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 500 }}>
                    All sessions
                  </div>

                  {sessions.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--mute)', fontStyle: 'italic' }}>
                      No sessions yet.
                    </p>
                  ) : (
                    sessions.map(s => (
                      <div
                        key={s.id}
                        style={{
                          marginBottom: 12, paddingBottom: 12,
                          borderBottom: '1px solid var(--line)',
                          display: 'flex', justifyContent: 'space-between', gap: 10,
                        }}
                      >
                        <div>
                          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 14, color: 'var(--teal)' }}>
                            {formatDate(s.scheduled_at)}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 2 }}>
                            {s.duration_mins ?? 60}min · {s.mode ?? 'video'} · {s.status}
                            {s.calendly_event_uri && ' · via Calendly'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', flexShrink: 0 }}>
                          {s.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => cancelSession(s.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: 11, padding: '4px 8px' }}
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteSession(s.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: 11, padding: '4px 8px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
