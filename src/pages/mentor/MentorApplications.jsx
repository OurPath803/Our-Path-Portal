import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const STATUSES = ['new', 'in_review', 'approved', 'declined']

const STATUS_LABEL = {
  new: 'New',
  in_review: 'In review',
  approved: 'Approved',
  declined: 'Declined',
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
  const [flash, setFlash] = useState('')

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

  async function changeStatus(app, newStatus) {
    if (newStatus === app.status) return
    setSavingId(app.id)
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', app.id)

    if (!error) {
      setApps(rows => rows.map(r => r.id === app.id ? { ...r, status: newStatus } : r))

      if (newStatus === 'approved') {
        await callSendEmail({
          type: 'application_accepted',
          to: app.email,
          data: { name: app.applicant_name, email: app.email },
        })
        setFlash(`Approval email sent to ${app.email}.`)
        setTimeout(() => setFlash(''), 4000)
      }
    }
    setSavingId(null)
  }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div className="journal-head">
            <div className="eyebrow">Applications · {apps.length} total</div>
            <h1>Session Zero applications</h1>
            <p className="pull">
              Each row is a person who's asked to be considered. Review what they wrote,
              and move the status when you've responded.
            </p>
          </div>

          {flash && <div className="auth-success">{flash}</div>}

          {loading ? (
            <div className="loading">Loading applications…</div>
          ) : apps.length === 0 ? (
            <div className="empty-state">No applications yet.</div>
          ) : (
            apps.map(app => (
              <div key={app.id} className="card" style={{ marginBottom: 16 }}>
                <div className="card-title">
                  <div>
                    <h3 style={{ marginBottom: 2 }}>{app.applicant_name}</h3>
                    <div style={{ fontSize: 13, color: 'var(--mute)' }}>
                      {app.email} · submitted {formatDate(app.created_at)}
                    </div>
                  </div>
                  <select
                    value={app.status}
                    onChange={e => changeStatus(app, e.target.value)}
                    disabled={savingId === app.id}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: 4,
                      background: 'var(--cream)',
                      color: 'var(--teal)',
                      fontFamily: 'inherit',
                      fontSize: 13,
                    }}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 4 }}>
                      Preferred rhythm
                    </div>
                    <div style={{ color: 'var(--teal)', textTransform: 'capitalize' }}>{app.preferred_rhythm ?? '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 4 }}>
                      Preferred mode
                    </div>
                    <div style={{ color: 'var(--teal)', textTransform: 'capitalize' }}>
                      {(app.preferred_mode ?? '—').replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {app.reason_for_support && (
                  <div>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 6 }}>
                      What's drawing them here
                    </div>
                    <p style={{
                      fontFamily: 'Fraunces, serif', fontStyle: 'italic',
                      color: 'var(--teal)', lineHeight: 1.6, fontSize: 15,
                      borderLeft: '3px solid var(--gold)', paddingLeft: 14, margin: 0,
                    }}>
                      "{app.reason_for_support}"
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
