import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { useTheme, THEMES } from '../lib/theme'

// Tiny preview swatches that hint at each theme's palette.
const PREVIEWS = {
  cream:  { bg: '#F5EED9', card: '#FAF7F0', accent: '#C9A84C', text: '#1B2B4B' },
  night:  { bg: '#0E1A1F', card: '#1A2A30', accent: '#C9A84C', text: '#E8EFE8' },
  sand:   { bg: '#EDE3CC', card: '#FFF4DB', accent: '#B8884F', text: '#1B2B4B' },
  forest: { bg: '#EBEEDD', card: '#F8FAEC', accent: '#8B7E3E', text: '#142B30' },
}

export default function Settings() {
  const { user, profile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [theme, setTheme] = useTheme()

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name)
  }, [profile?.full_name])

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
            <p className="pull">Your account, your portal.</p>
          </div>

          {/* ─────────────── Profile ─────────────── */}
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-title">
              <h3>Profile</h3>
            </div>
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

          {/* ─────────────── Theme ─────────────── */}
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-title">
              <h3>Appearance</h3>
              <span className="tag">Saved on this device</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 16 }}>
              Pick the palette that's easiest on your eyes. The change applies straight away;
              your choice is remembered for next time.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}>
              {THEMES.map(t => {
                const p = PREVIEWS[t.id]
                const active = theme === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    style={{
                      display: 'block',
                      padding: 12,
                      border: active ? '2px solid var(--gold)' : '1px solid var(--line)',
                      borderRadius: 6,
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                    }}
                  >
                    {/* Preview swatch */}
                    <div style={{
                      display: 'flex', height: 56, borderRadius: 4,
                      overflow: 'hidden', border: '1px solid var(--line)',
                      marginBottom: 10,
                    }}>
                      <div style={{ flex: 1, background: p.bg }} />
                      <div style={{ flex: 1, background: p.card, position: 'relative' }}>
                        <div style={{
                          position: 'absolute', top: 8, left: 8,
                          width: 20, height: 4, background: p.text, borderRadius: 2,
                        }} />
                        <div style={{
                          position: 'absolute', top: 18, left: 8,
                          width: 36, height: 3, background: p.text, opacity: 0.5, borderRadius: 2,
                        }} />
                        <div style={{
                          position: 'absolute', bottom: 8, left: 8,
                          width: 12, height: 12, background: p.accent, borderRadius: 2,
                        }} />
                      </div>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: 4,
                    }}>
                      <span style={{
                        fontFamily: 'Cormorant Garamond, serif', fontSize: 16,
                        color: 'var(--navy)', fontWeight: 500,
                      }}>
                        {t.label}
                      </span>
                      {active && (
                        <span style={{
                          fontSize: 10, letterSpacing: '0.12em',
                          textTransform: 'uppercase', color: 'var(--gold)',
                          fontWeight: 600,
                        }}>
                          Active
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.4,
                    }}>
                      {t.description}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
