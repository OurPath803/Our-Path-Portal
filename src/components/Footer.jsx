import { Link } from 'react-router-dom'

// Compact, on-brand footer used on public/legal pages and (optionally) at
// the bottom of in-portal pages via .portal-footer.
export default function Footer({ inPortal = false }) {
  return (
    <footer className={inPortal ? 'portal-footer' : 'public-footer'}>
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">OurPath<span> Guidance</span></span>
          <span className="footer-meta">
            OurPath Guidance Ltd · Registered in England &amp; Wales
          </span>
        </div>
        <nav className="footer-links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/cookies">Cookies</Link>
          <Link to="/safeguarding">Safeguarding</Link>
          <a href="mailto:hello@ourpathguidance.co.uk">Contact</a>
        </nav>
      </div>
    </footer>
  )
}
