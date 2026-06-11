import { useState } from 'react'
import { Link } from 'react-router-dom'

// variant: 'dark' = header on cream/light page (uses dark logo)
//          'light' = header on navy page (uses light logo)
export default function MarketingHeader({ variant = 'dark' }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const logoSrc = variant === 'light'
    ? '/ourpath-horizontal-light.png'
    : '/ourpath-horizontal-dark.png'

  return (
    <header className={`mkt-header${variant === 'light' ? ' mkt-header--light' : ''}`}>
      <Link to="/" className="mkt-logo" onClick={close}>
        <img src={logoSrc} alt="OurPath Guidance" className="mkt-logo-img" />
      </Link>

      <nav className={`mkt-nav${open ? ' is-open' : ''}`}>
        <Link to="/triage-call" onClick={close}>Mentoring</Link>
        <Link to="/our-story" onClick={close}>Our Story</Link>
        <Link to="/workshops" onClick={close}>Workshops</Link>
        <Link to="/training" onClick={close}>Training</Link>
        <Link to="/barakah-base" onClick={close}>Barakah Base</Link>
        <Link to="/blog" onClick={close}>Blog</Link>
        <Link to="/contact" onClick={close}>Contact</Link>
      </nav>

      <div className={`mkt-cta-set${open ? ' is-open' : ''}`}>
        <Link to="/login" className="btn btn-ghost btn-sm" onClick={close}>Sign in</Link>
        <Link to="/referral" className="btn btn-gold btn-sm" onClick={close}>Begin Session Zero</Link>
      </div>

      <button
        className="nav-hamburger"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen(o => !o)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  )
}
