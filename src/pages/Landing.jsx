import { Link } from 'react-router-dom'
import MarketingHeader from '../components/MarketingHeader'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <MarketingHeader />

      {/* Hero */}
      <section className="hero">
        {/* OurPath gold mark */}
        <img
          src="/ourpath-icon-gold.png"
          alt=""
          aria-hidden="true"
          style={{ width: 68, height: 68, display: 'block', margin: '0 auto 28px', objectFit: 'contain' }}
        />
        <div className="eyebrow">Mentoring · Reflection · Orientation</div>
        <h1>Personal Development Through Guidance &amp; Mentoring</h1>
        <p className="lede">
          OurPath helps young adults take stock of where they are and decide where to go next.
          One-to-one mentoring and small workshops. It isn't therapy, and it isn't coaching.
          It's something quieter, and more honest.
        </p>
        <div className="hero-ctas">
          <Link to="/referral" className="btn btn-gold">Book a Free Conversation</Link>
          <Link to="/triage-call" className="btn btn-ghost">See How It Works</Link>
        </div>
        {/* Geometric ornament — octagram skeleton, navy + gold */}
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          fill="none"
          style={{ width: 220, height: 220, display: 'block', margin: '36px auto 0', opacity: 0.13 }}
        >
          <rect x="42" y="42" width="116" height="116" stroke="#1E3A5F" strokeWidth="1.2" transform="rotate(0 100 100)"/>
          <rect x="42" y="42" width="116" height="116" stroke="#1E3A5F" strokeWidth="1.2" transform="rotate(45 100 100)"/>
          <rect x="22" y="22" width="156" height="156" stroke="#C9A84C" strokeWidth="0.7" transform="rotate(22.5 100 100)"/>
          <circle cx="100" cy="100" r="58" stroke="#1E3A5F" strokeWidth="0.9"/>
          <circle cx="100" cy="100" r="88" stroke="#1E3A5F" strokeWidth="0.5"/>
          <circle cx="100" cy="100" r="8" stroke="#C9A84C" strokeWidth="1.4"/>
          <circle cx="100" cy="12" r="2.5" fill="#C9A84C"/>
          <circle cx="188" cy="100" r="2.5" fill="#C9A84C"/>
          <circle cx="100" cy="188" r="2.5" fill="#C9A84C"/>
          <circle cx="12" cy="100" r="2.5" fill="#C9A84C"/>
        </svg>
      </section>

      {/* Where Most People Are */}
      <section className="mkt-section mkt-section--navy">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">Where Most People Are</div>
            <h2>Energy goes everywhere. Growth goes nowhere.</h2>
            <p>
              Work, family, faith, health, ambitions. You're pouring effort into all of them.
              Without a structure to hold it together, the energy scatters and nothing gets the depth it needs.
            </p>
          </div>
          <ul className="managing-list">
            <li className="managing-item">
              <div className="managing-num">01</div>
              <p>You're always busy. But you can't name what this season is actually asking of you.</p>
            </li>
            <li className="managing-item">
              <div className="managing-num">02</div>
              <p>Effort keeps going up. Depth keeps going down. Everything gets surface attention.</p>
            </li>
            <li className="managing-item">
              <div className="managing-num">03</div>
              <p>You feel stuck. You aren't in crisis. You're just unclear on which direction is actually yours.</p>
            </li>
          </ul>
        </div>
      </section>

      {/* What Reflective Practice Changes */}
      <section className="mkt-section" style={{ background: 'var(--cream)' }}>
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">What Reflective Practice Changes</div>
            <h2>Same life. Routed through reflection.</h2>
            <p>
              The demands don't disappear. They stop competing. Reflective practice gives you a
              centre to route decisions through, so every part of your life gets the attention it deserves.
            </p>
          </div>
          <ul className="reflection-list">
            <li className="reflection-item">
              <div className="reflection-num">01</div>
              <p>Name what you carry. Roles, expectations, assumptions. Get them on the page, not just in your head.</p>
            </li>
            <li className="reflection-item">
              <div className="reflection-num">02</div>
              <p>Route decisions through a centre. One structured question, asked honestly, clarifies more than ten urgent ones.</p>
            </li>
            <li className="reflection-item">
              <div className="reflection-num">03</div>
              <p>Choose your direction. Not all at once. Just the next faithful step, and the one after that.</p>
            </li>
          </ul>
        </div>
      </section>

      <hr className="section-rule section-rule--center" />

      {/* Three Pathways */}
      <section className="mkt-section" style={{ background: 'var(--cream)' }}>
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">How You Develop with OurPath</div>
            <h2>Three pathways.</h2>
          </div>
          <div className="pathways-grid">
            <div className="pathway-card">
              {/* Single arch — 1-1 mentoring */}
              <svg aria-hidden="true" width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ marginBottom: 16 }}>
                <path d="M 4 42 L 4 20 A 18 18 0 0 1 40 20 L 40 42" stroke="#C9A84C" strokeWidth="1.5"/>
                <line x1="4" y1="42" x2="40" y2="42" stroke="#1E3A5F" strokeWidth="1.5"/>
              </svg>
              <div className="pathway-type">1-1 Mentoring · Guided</div>
              <h3>Personalised Sessions</h3>
              <p>Someone to hold the structure while you do the work.</p>
              <Link to="/triage-call" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>How it works →</Link>
            </div>
            <div className="pathway-card">
              {/* Triple arch — group workshop */}
              <svg aria-hidden="true" width="60" height="44" viewBox="0 0 60 44" fill="none" style={{ marginBottom: 16 }}>
                <path d="M 2 42 L 2 26 A 8 8 0 0 1 18 26 L 18 42 M 22 42 L 22 26 A 8 8 0 0 1 38 26 L 38 42 M 42 42 L 42 26 A 8 8 0 0 1 58 26 L 58 42" stroke="#C9A84C" strokeWidth="1.5"/>
                <line x1="2" y1="42" x2="58" y2="42" stroke="#1E3A5F" strokeWidth="1.5"/>
              </svg>
              <div className="pathway-type">Workshop Series · Group</div>
              <h3>4-Week Guided Experience</h3>
              <p>Small cohort. Structured reflective practice.</p>
              <Link to="/workshops" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>See the structure →</Link>
            </div>
            <div className="pathway-card">
              {/* Concentric rings — independent practice */}
              <svg aria-hidden="true" width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ marginBottom: 16 }}>
                <circle cx="22" cy="22" r="18" stroke="#1E3A5F" strokeWidth="1.5"/>
                <circle cx="22" cy="22" r="10" stroke="#C9A84C" strokeWidth="1"/>
                <circle cx="22" cy="22" r="3" fill="#C9A84C" opacity="0.6"/>
                <line x1="22" y1="4" x2="22" y2="40" stroke="#C9A84C" strokeWidth="0.8" opacity="0.35"/>
                <line x1="4" y1="22" x2="40" y2="22" stroke="#C9A84C" strokeWidth="0.8" opacity="0.35"/>
              </svg>
              <div className="pathway-type">Reflective Journal · Independent</div>
              <h3>52 Weeks of Structured Practice</h3>
              <p>Coming soon.</p>
              <span className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', opacity: 0.4, cursor: 'default' }}>Learn more →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Where OurPath Sits */}
      <section className="mkt-section mkt-section--navy">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">Where OurPath Sits</div>
            <h2>The space in between.</h2>
          </div>
          <div className="pos-diagram">
            <div className="pos-cell">
              <div className="pos-cell-label">Not this</div>
              <div className="pos-cell-name">Therapy</div>
            </div>
            <div className="pos-cell">
              <div className="pos-cell-label">Not this</div>
              <div className="pos-cell-name">Coaching</div>
            </div>
            <div className="pos-cell pos-cell--active">
              <div className="pos-cell-label">This</div>
              <div className="pos-cell-name">OurPath</div>
            </div>
            <div className="pos-cell">
              <div className="pos-cell-label">Within this</div>
              <div className="pos-cell-name">Personal Development</div>
            </div>
          </div>
          <p className="pos-sub">For people who are managing well, but who know they aren't growing on purpose.</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mkt-section mkt-section--off-white">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">What People Say</div>
            <h2>In their own words.</h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-quote">"I've noticed it shifts between spiritual topics to things on my mind from a work perspective. It's interesting to see the main things in my life become clearer."</p>
              <div className="testimonial-attr">A. · Reflective journal user</div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">"Even thinking about the questions themselves throughout the week grounds my thinking. I can have two questions on my mind and see the impact and consequences that follow from that."</p>
              <div className="testimonial-attr">M. · Mentoring participant</div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">"I've spoken about my decision paralysis before. Noticing that has come from the journalling, and now I'm finding myself being more deliberate with the steps I take and not worrying too much about the what-ifs."</p>
              <div className="testimonial-attr">S. · Mentoring participant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="mkt-section" style={{ background: 'var(--cream)' }}>
        <div className="section-inner">
          <div className="eyebrow" style={{ marginBottom: 8 }}>Working Alongside</div>
          <h2 style={{ fontSize: 28, color: 'var(--navy)', margin: '0' }}>Our partners</h2>
          <div className="partner-card">
            <div>
              <h3>Qiman — Institute of Arabic &amp; Islamic Sciences</h3>
              <p>Scholarly partnership in Islamic education and pastoral formation</p>
            </div>
            <a href="https://www.qiman.org" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Visit website →</a>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-cta">
        <div className="eyebrow">Start Your Development</div>
        <h2>Ready to move from managing to growing?</h2>
        <p>Book a free 20-minute conversation. There's no commitment. It's just a chance to talk.</p>
        <div className="cta-btns">
          <Link to="/referral" className="btn btn-gold">Book a Free Conversation</Link>
          <Link to="/triage-call" className="btn btn-ghost">See How It Works</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
