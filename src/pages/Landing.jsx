import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <header className="mkt-header">
        <div className="mkt-logo">OurPath<span> Guidance</span></div>
        <nav className="mkt-nav">
          <a href="#approach">Our approach</a>
          <Link to="/rhythms" style={{ borderBottom: 'none', color: 'var(--ink-soft)' }}>Mentoring</Link>
          <a href="#approach">Journal</a>
          <Link to="/rhythms" style={{ borderBottom: 'none', color: 'var(--ink-soft)' }}>Rhythms</Link>
          <a href="#approach">About</a>
        </nav>
        <div className="mkt-cta-set">
          <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/session-zero" className="btn btn-primary btn-sm">Request Session Zero</Link>
        </div>
      </header>

      <div className="hero">
        <div className="eyebrow">Mentoring · Reflection · Orientation</div>
        <h1>You can be responsible and still be lost. Those aren't opposites.</h1>
        <p className="lede">
          Structured one-to-one mentoring and reflective work for people who want to stop performing
          and start locating themselves. Developmental, not therapeutic. Orientation, not optimisation.
        </p>
        <div className="hero-ctas">
          <Link to="/session-zero" className="btn btn-primary">Begin with Session Zero</Link>
          <a href="#approach" className="btn btn-ghost">Read the approach</a>
        </div>
      </div>

      <div className="positioning" id="approach">
        <div className="positioning-grid">
          <div>
            <h4>Developmental, <span>not therapeutic</span></h4>
            <p>We don't fix feelings. We build capacity — to notice, to name, to choose with clarity rather than compulsion.</p>
          </div>
          <div>
            <h4>Reflective, <span>not reactive</span></h4>
            <p>The work happens in the pause. Before momentum. Before justification. In the space where something honest can be said.</p>
          </div>
          <div>
            <h4>Orientation, <span>not optimisation</span></h4>
            <p>We're not here to help you achieve more. We're here to help you know where you are, and move from there.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
