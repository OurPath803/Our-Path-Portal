import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="logo">OurPath<span> Guidance</span></div>
        <h1>Reset your password.</h1>
        <p>We'll send a link to your email so you can set a new one.</p>
      </div>

      <div className="auth-right">
        <h2>Forgot password</h2>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 24, fontSize: 14 }}>
          Enter the email you signed up with. If we have an account on file, a reset link
          will be on its way.
        </p>

        {error && <div className="auth-error">{error}</div>}
        {sent ? (
          <div className="auth-success">
            Check your email. The link expires in an hour.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--mute)', textAlign: 'center' }}>
          Remembered it? <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
