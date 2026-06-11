import { Link } from 'react-router-dom'
import MarketingHeader from '../components/MarketingHeader'
import Footer from '../components/Footer'

export default function Workshops() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <MarketingHeader />

      {/* Hero */}
      <section className="workshops-hero">
        <div className="eyebrow">Workshop Series · Group</div>
        <h1>Four weeks. Four tools. One clear direction.</h1>
        <p>
          A guided personal development experience built around structured reflective practice.
          Small cohort, weekly sessions, and practical tools you keep for life.
        </p>
        <Link to="/referral" className="btn btn-gold">Book a Screening Conversation</Link>
        {/* 4-panel geometric — four workshops, cream/gold on navy */}
        <svg
          aria-hidden="true"
          viewBox="0 0 160 160"
          fill="none"
          style={{ width: 160, height: 160, display: 'block', margin: '40px auto 0', opacity: 0.75 }}
        >
          <rect x="8" y="8" width="60" height="60" stroke="rgba(250,250,248,0.3)" strokeWidth="1"/>
          <rect x="92" y="8" width="60" height="60" stroke="rgba(250,250,248,0.3)" strokeWidth="1"/>
          <rect x="8" y="92" width="60" height="60" stroke="rgba(250,250,248,0.3)" strokeWidth="1"/>
          <rect x="92" y="92" width="60" height="60" stroke="rgba(250,250,248,0.3)" strokeWidth="1"/>
          <line x1="80" y1="0" x2="80" y2="160" stroke="#C9A84C" strokeWidth="1.5"/>
          <line x1="0" y1="80" x2="160" y2="80" stroke="#C9A84C" strokeWidth="1.5"/>
          <polygon points="38,20 55,38 38,56 21,38" stroke="rgba(250,250,248,0.35)" strokeWidth="0.8" fill="none"/>
          <polygon points="122,20 139,38 122,56 105,38" stroke="rgba(250,250,248,0.35)" strokeWidth="0.8" fill="none"/>
          <polygon points="38,104 55,122 38,140 21,122" stroke="rgba(250,250,248,0.35)" strokeWidth="0.8" fill="none"/>
          <polygon points="122,104 139,122 122,140 105,122" stroke="rgba(250,250,248,0.35)" strokeWidth="0.8" fill="none"/>
          <circle cx="80" cy="80" r="5" fill="#C9A84C" opacity="0.65"/>
        </svg>
      </section>

      {/* Journey intro */}
      <section className="mkt-section mkt-section--off-white">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">The Journey</div>
            <h2>Four weeks of structured development.</h2>
            <p>
              Each session builds on the last. You'll leave with a Position Map, a Cost Audit,
              an Integration Filter, and an Orientation Statement — practical tools you return
              to whenever you need to recalibrate.
            </p>
          </div>
        </div>
      </section>

      {/* 4-session breakdown */}
      <section className="sessions-section">
        <div className="section-inner">
          <div className="sessions-grid">
            <div className="session-card">
              <div className="session-num">01</div>
              <div className="session-action">See Your Position</div>
              <h3>Roles</h3>
              <div className="session-tool">Position Map</div>
            </div>
            <div className="session-card">
              <div className="session-num">02</div>
              <div className="session-action">Name the Cost</div>
              <h3>Audit Commitments</h3>
              <div className="session-tool">Cost Audit</div>
            </div>
            <div className="session-card">
              <div className="session-num">03</div>
              <div className="session-action">Learn vs. Accumulate</div>
              <h3>Sort Experience</h3>
              <div className="session-tool">Integration Filter</div>
            </div>
            <div className="session-card">
              <div className="session-num">04</div>
              <div className="session-action">Choose Your Orientation</div>
              <h3>Direction</h3>
              <div className="session-tool">Orientation Statement</div>
            </div>
          </div>
        </div>
      </section>

      {/* Format + Who it's for */}
      <section className="workshop-format">
        <div className="workshop-format-inner">
        <div className="format-block">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Format</div>
          <h2>Small groups. Structured practice.</h2>
          <p>
            Each cohort is deliberately small — enough for shared resonance,
            not so large that depth gets lost.
          </p>
          <ul className="format-details">
            <li>75-minute live sessions via Zoom</li>
            <li>Small cohorts — limited places per series</li>
            <li>Companion worksheets included</li>
            <li>Practical tools you keep after the series ends</li>
          </ul>
        </div>
        <div className="format-block">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Who It's For</div>
          <h2>People who want to see clearly.</h2>
          <p>
            Adults who want structured personal development — not a fix, not motivation,
            but a way of seeing clearly.
          </p>
          <p>
            The framework draws on Islamic tradition but is designed for anyone who resonates
            with the approach. The principles are universal.
          </p>
          <p>
            <strong style={{ color: 'var(--navy)' }}>Next cohort:</strong> Dates to be announced.
            Book a screening conversation for early access.
          </p>
        </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">Questions</div>
            <h2>What people ask.</h2>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <p className="faq-q">Will I have to share personal details?</p>
              <p className="faq-a">Never. Sessions are structured around frameworks, not personal disclosure. All sharing is voluntary.</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">Is this only for Muslims?</p>
              <p className="faq-a">The framework draws on Islamic tradition, but it's designed for anyone who resonates with the approach. The principles are universal.</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">How is this different from coaching?</p>
              <p className="faq-a">Coaching asks 'where do you want to be?' OurPath asks 'where do you actually stand, and what does this season require of you?'</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-cta">
        <div className="eyebrow">Ready to Start</div>
        <h2>Ready to start your development?</h2>
        <p>Book a free conversation to explore whether the workshop series is right for you.</p>
        <div className="cta-btns">
          <Link to="/referral" className="btn btn-gold">Book a Free Conversation</Link>
          <Link to="/triage-call" className="btn btn-ghost">Explore 1-1 Mentoring</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
