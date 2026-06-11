import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const TOOL_OPTIONS = [
  { slug: 'ocs-checkin',        label: 'OCS Check-In (Pre · OCS · Post)' },
  { slug: 'nine-domains',       label: 'Nine Reflection Domains' },
  { slug: 'progress-review',    label: 'Progress Review' },
  { slug: 'clarity-map',        label: 'Clarity Map' },
  { slug: 'decision-sheet',     label: 'Decision Discernment Sheet' },
  { slug: 'energy-audit',       label: 'Energy & Capacity Audit' },
  { slug: 'values-alignment',   label: 'Values-to-Actions Alignment' },
  { slug: 'position-map',       label: 'Position Map' },
  { slug: 'cost-audit',         label: 'Cost Audit' },
  { slug: 'integration-filter', label: 'Integration Filter' },
  { slug: 'orientation',        label: 'Orientation Framework' },
]

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

  // Tool assignment state
  const [toolAssignments, setToolAssignments] = useState([])
  const [assigningTool, setAssigningTool] = useState('')
  const [assignNotes, setAssignNotes] = useState('')
  const [savingTool, setSavingTool] = useState(false)
  const [toolFlash, setToolFlash] = useState('')

  // Induction pack state
  const [induction, setInduction] = useState(null)
  const [sendingInduction, setSendingInduction] = useState(false)
  const [inductionFlash, setInductionFlash] = useState('')

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

    const [menteeRes, subRes, sesRes, toolRes, inductionRes] = await Promise.all([
      supabase.from('profiles')
        .select('id, full_name, email, role::text, mentor_id')
        .eq('id', menteeId).maybeSingle(),
      supabase.from('subscriptions')
        .select('*').eq('mentee_id', menteeId)
        .order('started_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('sessions')
        .select('*').eq('mentee_id', menteeId)
        .order('scheduled_at', { ascending: false }),
      supabase.from('tool_assignments')
        .select('*').eq('mentee_id', menteeId)
        .order('assigned_at', { ascending: false }),
      supabase.from('induction_forms')
        .select('*').eq('mentee_id', menteeId)
        .order('sent_at', { ascending: false }).limit(1).maybeSingle(),
    ])

    if (menteeRes.error || !menteeRes.data) {
      setError('Mentee not found, or you don\'t have access.')
      setLoading(false)
      return
    }

    setMentee(menteeRes.data)
    setSubscription(subRes.data)
    setSessions(sesRes.data ?? [])
    setToolAssignments(toolRes.data ?? [])
    setInduction(inductionRes.data ?? null)
    if (subRes.data) {
      setSubForm({ rhythm: subRes.data.rhythm, status: subRes.data.status })
    }
    setLoading(false)
  }

  async function saveSubscription(e) {
    e.preventDefault()
    setSavingSub(true)
    setSubFlash('')

    const previousStatus = subscription?.status

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

    // Lifecycle email if status changed (or first activation).
    if (mentee?.email && previousStatus !== subForm.status) {
      const typeMap = {
        active: 'subscription_activated',
        paused: 'subscription_paused',
        cancelled: 'subscription_cancelled',
      }
      const type = typeMap[subForm.status]
      if (type) {
        fetch('/.netlify/functions/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            to: mentee.email,
            data: {
              name: mentee.full_name,
              rhythm: subForm.rhythm,
            },
          }),
        }).catch(() => {})
      }
    }
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

  async function assignTool(e) {
    e.preventDefault()
    if (!assigningTool) { setToolFlash('Select a tool first.'); return }
    setSavingTool(true)
    setToolFlash('')

    const alreadyActive = toolAssignments.find(
      t => t.tool_slug === assigningTool && !t.revoked_at
    )
    if (alreadyActive) {
      setToolFlash('This tool is already assigned.')
      setSavingTool(false)
      setTimeout(() => setToolFlash(''), 3000)
      return
    }

    const { error } = await supabase.from('tool_assignments').insert({
      mentee_id:   menteeId,
      assigned_by: user.id,
      tool_slug:   assigningTool,
      notes:       assignNotes || null,
    })

    if (error) {
      setToolFlash(`Failed: ${error.message}`)
    } else {
      setToolFlash('Tool assigned.')
      setAssigningTool('')
      setAssignNotes('')
      await load()
    }
    setSavingTool(false)
    setTimeout(() => setToolFlash(''), 4000)
  }

  async function revokeTool(id) {
    if (!confirm('Revoke access to this tool? The mentee will no longer see it on their dashboard.')) return
    await supabase.from('tool_assignments').update({ revoked_at: new Date().toISOString() }).eq('id', id)
    await load()
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

  async function sendInductionPack() {
    if (!mentee?.email) { setInductionFlash('No email on record for this mentee.'); return }
    setSendingInduction(true)
    setInductionFlash('')

    // Insert a fresh row — token auto-generated by Supabase default
    const { data: row, error: insertErr } = await supabase
      .from('induction_forms')
      .insert({ mentee_id: menteeId })
      .select('token')
      .single()

    if (insertErr) {
      setInductionFlash(`Failed to create pack: ${insertErr.message}`)
      setSendingInduction(false)
      return
    }

    const inductionUrl = `${window.location.origin}/induction/${row.token}`

    const res = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'induction_pack',
        to: mentee.email,
        data: { name: mentee.full_name, inductionUrl },
      }),
    })

    if (!res.ok) {
      setInductionFlash('Pack created but email failed to send. Copy the link below and send manually.')
    } else {
      setInductionFlash(`Induction pack sent to ${mentee.email}.`)
    }

    setSendingInduction(false)
    await load()
    setTimeout(() => setInductionFlash(''), 6000)
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

              {/* ──────────────── Induction pack panel ──────────────── */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-title" style={{ marginBottom: 12 }}>
                  <h3>Induction Pack</h3>
                  {induction && (
                    <span className="tag" style={{
                      background: induction.completed_at ? '#E8F5EE' : 'var(--cream)',
                      color: induction.completed_at ? 'var(--success)' : 'var(--mute)',
                    }}>
                      {induction.completed_at ? 'Completed' : 'Awaiting response'}
                    </span>
                  )}
                </div>

                {inductionFlash && (
                  <div className={inductionFlash.startsWith('Failed') || inductionFlash.startsWith('No email') ? 'auth-error' : 'auth-success'} style={{ marginBottom: 12 }}>
                    {inductionFlash}
                  </div>
                )}

                {!induction ? (
                  <div>
                    <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 14 }}>
                      Send the mentee a personal link to complete the OurPath Client Induction Pack
                      before their first session. Covers personal details, presenting concerns, and consent.
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={sendingInduction}
                      onClick={sendInductionPack}
                    >
                      {sendingInduction ? 'Sending…' : 'Send Induction Pack'}
                    </button>
                  </div>
                ) : !induction.completed_at ? (
                  <div>
                    <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 8 }}>
                      Sent {formatDate(induction.sent_at)}. Awaiting completion.
                    </p>
                    <div style={{
                      background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 4,
                      padding: '10px 12px', fontSize: 12, color: 'var(--mute)',
                      fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 12,
                    }}>
                      {window.location.origin}/induction/{induction.token}
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={sendingInduction}
                      onClick={sendInductionPack}
                    >
                      {sendingInduction ? 'Resending…' : 'Resend email'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--mute)', marginBottom: 16 }}>
                      Completed {formatDate(induction.completed_at)}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { label: 'Full name', val: induction.full_name },
                        { label: 'Preferred name', val: induction.preferred_name },
                        { label: 'Date of birth', val: induction.date_of_birth },
                        { label: 'Phone', val: induction.phone },
                        { label: 'Referral source', val: induction.referral_source },
                        { label: 'What brings them here', val: induction.what_brings_you },
                        { label: "What's working well", val: induction.whats_working },
                        { label: "What's harder", val: induction.whats_harder },
                        { label: 'Background context', val: induction.background_context },
                        { label: 'Hoped change', val: induction.hoped_change },
                        { label: 'Readiness (1–5)', val: induction.readiness_score },
                      ].filter(f => f.val).map(f => (
                        <div key={f.label}>
                          <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
                          <div style={{ fontSize: 14, color: 'var(--charcoal)', lineHeight: 1.6 }}>{f.val}</div>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 16, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                        <span style={{ fontSize: 13, color: induction.service_consent ? 'var(--success)' : 'var(--mute)' }}>
                          {induction.service_consent ? '✓' : '✗'} Service consent
                        </span>
                        <span style={{ fontSize: 13, color: induction.privacy_consent ? 'var(--success)' : 'var(--mute)' }}>
                          {induction.privacy_consent ? '✓' : '✗'} Privacy consent
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ──────────────── Tool assignment panel ──────────────── */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-title">
                  <h3>Assigned Tools</h3>
                  <span className="tag">
                    {toolAssignments.filter(t => !t.revoked_at).length} active
                  </span>
                </div>

                {toolFlash && (
                  <div className={toolFlash.startsWith('Failed') || toolFlash.startsWith('Select') ? 'auth-error' : 'auth-success'}>
                    {toolFlash}
                  </div>
                )}

                <form onSubmit={assignTool} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                  <select
                    value={assigningTool}
                    onChange={e => setAssigningTool(e.target.value)}
                    style={{
                      flex: '1 0 200px', padding: '10px 12px',
                      border: '1px solid var(--line)', borderRadius: 4,
                      background: 'var(--cream)', color: 'var(--navy)',
                      fontFamily: 'inherit', fontSize: 14,
                    }}
                  >
                    <option value="">Select a tool…</option>
                    {TOOL_OPTIONS.map(t => (
                      <option key={t.slug} value={t.slug}>{t.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={assignNotes}
                    onChange={e => setAssignNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    style={{
                      flex: '2 0 200px', padding: '10px 12px',
                      border: '1px solid var(--line)', borderRadius: 4,
                      background: 'var(--cream)', color: 'var(--navy)',
                      fontFamily: 'inherit', fontSize: 14,
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={savingTool}
                  >
                    {savingTool ? 'Assigning…' : 'Assign'}
                  </button>
                </form>

                {toolAssignments.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--mute)', fontStyle: 'italic' }}>
                    No tools assigned yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {toolAssignments.map(t => {
                      const meta = TOOL_OPTIONS.find(o => o.slug === t.tool_slug)
                      return (
                        <div
                          key={t.id}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 12px',
                            background: t.revoked_at ? 'transparent' : 'var(--off-white)',
                            borderRadius: 4,
                            border: '1px solid var(--line)',
                            opacity: t.revoked_at ? 0.5 : 1,
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 14, color: 'var(--navy)', fontWeight: 500 }}>
                              {meta?.label ?? t.tool_slug}
                            </div>
                            {t.notes && (
                              <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 2 }}>{t.notes}</div>
                            )}
                            <div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 2 }}>
                              {t.revoked_at
                                ? `Revoked ${formatDate(t.revoked_at)}`
                                : `Assigned ${formatDate(t.assigned_at)}`}
                            </div>
                          </div>
                          {!t.revoked_at && (
                            <button
                              type="button"
                              onClick={() => revokeTool(t.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: 11, padding: '4px 8px', flexShrink: 0 }}
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
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
                          background: 'var(--cream)', color: 'var(--navy)',
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
                          background: 'var(--cream)', color: 'var(--navy)',
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
                          background: 'var(--cream)', color: 'var(--navy)',
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
                          background: 'var(--cream)', color: 'var(--navy)',
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
                          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: 'var(--navy)' }}>
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
