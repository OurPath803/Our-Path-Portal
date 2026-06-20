import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

// Status values match the applications table enum in schema.sql
const STATUSES = ['pending', 'screened', 'accepted', 'declined']

const STATUS_LABEL = {
  pending:  'Pending',
  screened: 'Screened',
  accepted: 'Accepted',
  declined: 'Declined',
}

const STATUS_COLOUR = {
  pending:  { background: 'rgba(201,168,76,0.12)', color: 'var(--gold)' },
  screened: { background: 'rgba(27,43,75,0.08)', color: 'var(--navy)' },
  accepted: { background: 'rgba(39,174,96,0.12)', color: 'var(--success)' },
  declined: { background: 'rgba(192,57,43,0.1)', color: 'var(--error)' },
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

async function callSendEmail(payload) {
  try {
    await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('send-email failed', err)
  }
}

export default function MentorApplications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [flash, setFlash] = useState('')
  const [flashType, setFlashType] = useState('success') // 'success' | 'error'

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    setApps(data ?? [])
    setLoading(false)
  }

  function showFlash(msg, type = 'success') {
    setFlash(msg)
    setFlashType(type)
    setTimeout(() => setFlash(''), 5000)
  }

  async function changeStatus(app, newStatus) {
    if (newStatus === app.status) return
    setSavingId(app.id)
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', app.id)

    if (!error) {
      setApps(rows => rows.map(r => r.id === app.id ? { ...r, status: newStatus } : r))

      if (newStatus === 'accepted') {
        await callSendEmail({
          type: 'application_accepted',
          to: app.email,
          data: { name: app.full_name, email: app.email },
        })
        showFlash(`Acceptance email sent to ${app.email}.`)
      }
    } else {
      showFlash(`Save failed: ${error.message}`, 'error')
    }
    setSavingId(null)
  }

  async function deleteApplication(app) {
    if (!confirm(`Remove "${app.full_name}" from the list?\n\nThis deletes the application record permanently.`)) return
    setDeletingId(app.id)
    const { error } = await supabase.from('applications').delete().eq('id', app.id)
    if (error) {
      showFlash(`Delete failed: ${error.message}`, 'error')
    } else {
      setApps(rows => rows.filter(r => r.id !== app.id))
      showFlash(`"${app.full_name}" removed.`)
    }
    setDeletingId(null)
  }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div className="journal-head">
            <div className="eyebrow">Applications · {apps.length} total</div>
            <h1>Triage call requests</h1>
            <p className="pull">
              Each row is a person who submitted the referral form. Review what they wrote,
              update the status as you work through triage, and remove when done.
            </p>
          </div>

          {flash && (
            <div className={flashType === 'error' ? 'auth-error' : 'auth-success'} style={{ marginBottom: 16 }}>
              {flash}
            </div>
          )}

          {loading ? (
            <div className="loading">Loading applications…</div>
          ) : apps.length === 0 ? (
            <div className="empty-state">No applications yet.</div>
          ) : (
            apps.map(app => (
              <div key={app.id} className="card" style={{ marginBottom: 16 }}>
                <div className="card-title">
                  <div>
                    <h3 style={{ marginBottom: 2 }}>{app.full_name ?? '—'}</h3>
                    <div style={{ fontSize: 13, color: 'var(--mute)' }}>
                      {app.email} · submitted {formatDate(app.created_at)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      value={app.status}
                      onChange={e => changeStatus(app, e.target.value)}
                      disabled={savingId === app.id || deletingId === app.id}
                      style={{
                        padding: '7px 10px',
                        border: '1px solid var(--line)',
                        borderRadius: 4,
                        background: STATUS_COLOUR[app.status]?.background ?? 'var(--cream)',
                        color: STATUS_COLOUR[app.status]?.color ?? 'var(--navy)',
                        fontFamily: 'inherit',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => deleteApplication(app)}
                      disabled={deletingId === app.id}
                      style={{
                        fontSize: 12, padding: '6px 10px', cursor: 'pointer',
                        border: '1px solid var(--line)', borderRadius: 4,
                        background: 'transparent', color: 'var(--mute)',
                        fontFamily: 'inherit',
                      }}
                    >
                      {deletingId === app.id ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                </div>

                {/* Contact & preferences */}
                <div className="app-meta-grid" style={{ marginBottom: app.presenting_concern ? 12 : 0 }}>
                  {app.phone && (
                    <div>
                      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 4 }}>
                        Phone
                      </div>
                      <a href={`tel:${app.phone}`} style={{ color: 'var(--navy)' }}>{app.phone}</a>
                    </div>
                  )}
                  {app.preferred_days && (
                    <div>
                      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 4 }}>
                        Preferred frequency
                      </div>
                      <div style={{ color: 'var(--navy)', textTransform: 'capitalize' }}>{app.preferred_days}</div>
                    </div>
                  )}
                  {app.referral_source && (
                    <div>
                      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 4 }}>
                        Referral source
                      </div>
                      <div style={{ color: 'var(--navy)', fontSize: 13 }}>{app.referral_source}</div>
                    </div>
                  )}
                </div>

                {app.presenting_concern && (
                  <div>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 6 }}>
                      What they shared
                    </div>
                    <p style={{
                      fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
                      color: 'var(--navy)', lineHeight: 1.6, fontSize: 15,
                      borderLeft: '3px solid var(--gold)', paddingLeft: 14, margin: 0,
                      whiteSpace: 'pre-line',
                    }}>
                      {app.presenting_concern}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
