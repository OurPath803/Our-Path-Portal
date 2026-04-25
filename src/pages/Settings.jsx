import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'

export default function Settings() {
  const { user, profile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div className="journal-head">
            <h1>Settings</h1>
          </div>

          <div style={{ maxWidth: 480 }}>
            <form onSubmit={save}>
              <div className="form-row">
                <label>Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label>Email</label>
                <input type="email" value={user?.email ?? ''} disabled style={{ opacity: 0.6 }} />
                <div className="hint">To change your email, contact hello@ourpathguidance.co.uk</div>
              </div>
              {saved && <div className="auth-success">Changes saved.</div>}
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
