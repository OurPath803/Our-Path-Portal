import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('in') // 'in' | 'up'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (tab === 'in') {
      const { error } = await signIn(email, password)
      if (error) { setError(error.message); setLoading(false) }
      else navigate('/dashboard')
    } else {
      if (!fullName.trim()) { setError('Please enter your name.'); setLoading(false); return }
      const { error } = await signUp(email, password, fullName)
      if (error) { setError(error.message); setLoading(false) }
      else setSuccess('Check your email to confirm your account, then sign in.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="logo">OurPath<span> Guidance</span></div>
        <h1>A space for honest reflection.</h1>
        <p>Your journal, your sessions, and your commitments — all in one place.</p>
        <div style={{ marginTop: 40, borderTop: '1px solid rgba(245,240,232,0.15)', paddingTop: 30 }}>
          <p style={{
            fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic',
            color: 'var(--gold-soft)', fontSize: 16, lineHeight: 1.55
          }}>
            "We don't start with goals. We start with where you actually are."
          </p>
          <p style={{ fontSize: 12, color: 'var(--mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 8 }}>
            — OurPath Mentoring Handbook
          </p>
        </div>
      </div>

      <div className="auth-right">
        <h2>{tab === 'in' ? 'Welcome back.' : 'Create your account.'}</h2>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 24, fontSize: 14 }}>
          {tab === 'in'
            ? 'Sign in to access your portal.'
            : 'You\'ll need to have completed Session Zero first.'}
        </p>

        <div className="auth-tab">
          <button className={tab === 'in' ? 'on' : ''} onClick={() => { setTab('in'); setError(''); setSuccess('') }}>
            Sign in
          </button>
          <button className={tab === 'up' ? 'on' : ''} onClick={() => { setTab('up'); setError(''); setSuccess('') }}>
            Create account
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {tab === 'up' && (
            <div className="form-row">
              <label>Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
          )}
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
          <div className="form-row">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={tab === 'up' ? 'Choose a password (min. 6 characters)' : ''}
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
            {loading ? 'Please wait…' : tab === 'in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--mute)', textAlign: 'center' }}>
          Not yet a mentee?{' '}
          <Link to="/session-zero">Request Session Zero</Link>
        </p>
      </div>
    </div>
  )
}
