import { Link } from 'react-router-dom'
import Footer from '../../components/Footer'

// Shared shell for the public legal pages (privacy, terms, cookies). Keeps
// the marketing-style header + content column + footer consistent across all
// three.
export default function LegalShell({ title, updated, children }) {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="legal-header">
        <Link to="/" className="legal-logo">
          OurPath<span> Guidance</span>
        </Link>
        <nav className="legal-nav">
          <Link to="/login">Sign in</Link>
          <Link to="/triage-call" className="btn btn-primary btn-sm">Book a triage call</Link>
        </nav>
      </header>

      <main className="legal-main">
        <div className="legal-content">
          <div className="eyebrow">{updated ? `Last updated ${updated}` : 'Legal'}</div>
          <h1 style={{ color: 'var(--navy)', marginBottom: 28 }}>{title}</h1>
          <div className="legal-prose">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
