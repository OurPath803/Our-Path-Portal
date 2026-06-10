import { Link } from 'react-router-dom'

export default function MarketingHeader() {
  return (
    <header className="mkt-header">
      <Link to="/" className="mkt-logo" style={{ borderBottom: 'none', textDecoration: 'none' }}>
        OurPath<span> Guidance</span>
      </Link>
      <nav className="mkt-nav">
        <Link to="/triage-call" style={{ borderBottom: 'none', color: 'var(--ink-soft)' }}>Mentoring</Link>
        <Link to="/our-story" style={{ borderBottom: 'none', color: 'var(--ink-soft)' }}>Our Story</Link>
        <Link to="/blog" style={{ borderBottom: 'none', color: 'var(--ink-soft)' }}>Blog</Link>
        <Link to="/contact" style={{ borderBottom: 'none', color: 'var(--ink-soft)' }}>Contact</Link>
      </nav>
      <div className="mkt-cta-set">
        <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
        <Link to="/referral" className="btn btn-primary btn-sm">Begin Session Zero</Link>
      </div>
    </header>
  )
}
