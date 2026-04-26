import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [success, setSuccess] = useState(false)

  // Supabase fires PASSWORD_RECOVERY on this page after the redirect; we then
  // know we have a session that's allowed to update the password.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
      }
    })

    // If the session is already established (e.g. user reloaded the page),
    // honour that too.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Sign out so the user has to authenticate fresh with the new password.
    await supabase.auth.signOut()
    setSuccess(true)
    setLoading(false)
    setTimeout(() => navigate('/login'), 1500)
  }

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="logo">OurPath<span> Guidance</span></div>
        <h1>Set a new password.</h1>
        <p>Choose something you'll remember. You can change it again later from Settings.</p>
      </div>

      <div className="auth-right">
        <h2>New password</h2>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 24, fontSize: 14 }}>
          Enter and confirm your new password below.
        </p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">Password updated. Redirecting to sign in…</div>}

        {!ready && !success ? (
          <p style={{ fontSize: 14, color: 'var(--mute)', fontStyle: 'italic' }}>
            Verifying your reset link…
          </p>
        ) : !success && (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>New password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="form-row">
              <label>Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}

        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--mute)', textAlign: 'center' }}>
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
