import { Link } from 'react-router-dom'
import MarketingHeader from '../components/MarketingHeader'
import Footer from '../components/Footer'

export default function TriageCall() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <MarketingHeader />

      {/* Hero */}
      <section className="mentoring-hero">
        <div className="eyebrow">Personal Development · 1-1 Mentoring</div>
        <h1>Guided development through reflective practice.</h1>
        <p>
          Some growth can only happen in conversation. 1-1 mentoring gives you a structured
          space to see clearly, take ownership, and choose deliberately — with someone holding
          the framework alongside you.
        </p>
        <Link to="/referral" className="btn btn-gold">Begin Session Zero</Link>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">How It Works</div>
            <h2>Four stages. One developmental arc.</h2>
            <p>
              This isn't therapy or life coaching. It's guided personal development — structured
              reflective practice with someone who can hold the questions alongside you.
            </p>
          </div>
          <div className="how-stages">
            <div className="how-stage">
              <div className="how-stage-num">1</div>
              <div className="how-stage-meta">20 min · No obligation</div>
              <h4>Free Conversation</h4>
              <p>An honest introduction to the framework and whether it's right for you.</p>
            </div>
            <div className="how-stage">
              <div className="how-stage-num">2</div>
              <div className="how-stage-meta">Intake · Where you stand</div>
              <h4>Session Zero</h4>
              <p>Map your current position, roles, and what's drawing you here.</p>
            </div>
            <div className="how-stage">
              <div className="how-stage-num">3</div>
              <div className="how-stage-meta">50–60 min · Weekly or fortnightly</div>
              <h4>Development Sessions</h4>
              <p>Structured reflective work building through al-Masīr phases.</p>
            </div>
            <div className="how-stage">
              <div className="how-stage-num">4</div>
              <div className="how-stage-meta">Continue, pause, or close</div>
              <h4>Review &amp; Next Steps</h4>
              <p>Assess progress and decide what this season of life requires next.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing-section">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">Your Investment</div>
            <h2>Three levels. One commitment to growth.</h2>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-tier">Try It</div>
              <h3>Single Session</h3>
              <div className="pricing-price">£30</div>
              <div className="pricing-per">one-off session</div>
              <ul className="pricing-features">
                <li>1 structured session</li>
                <li>50–60 minutes</li>
                <li>Online or in-person</li>
              </ul>
            </div>
            <div className="pricing-card pricing-card--featured">
              <div className="pricing-tier">Starter</div>
              <h3>4 Sessions</h3>
              <div className="pricing-price">£120</div>
              <div className="pricing-per">£30 per session</div>
              <ul className="pricing-features">
                <li>4 structured sessions</li>
                <li>Session Zero included</li>
                <li>Online or in-person</li>
              </ul>
            </div>
            <div className="pricing-card">
              <div className="pricing-tier">Standard</div>
              <h3>8 Sessions</h3>
              <div className="pricing-price">£240</div>
              <div className="pricing-per">£30 per session</div>
              <ul className="pricing-features">
                <li>8 structured sessions</li>
                <li>Session Zero included</li>
                <li>Mid-point review</li>
              </ul>
            </div>
            <div className="pricing-card">
              <div className="pricing-tier">Comprehensive</div>
              <h3>12 Sessions</h3>
              <div className="pricing-price">£360</div>
              <div className="pricing-per">£30 per session</div>
              <ul className="pricing-features">
                <li>12 structured sessions</li>
                <li>Mid-point &amp; final reviews</li>
                <li>Orientation Statement</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">Common Questions</div>
            <h2>Three questions everyone asks.</h2>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <p className="faq-q">Is this therapy?</p>
              <p className="faq-a">No. OurPath is personal development — developmental guidance and mentoring, not clinical intervention. If therapeutic support would serve you better, we'll help you find the right fit.</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">How is this different from coaching?</p>
              <p className="faq-a">Coaching focuses on performance and goals. OurPath focuses on personal development through reflective practice — helping you see where you stand and choose your direction from clarity.</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">What if I need something different?</p>
              <p className="faq-a">That's a valuable outcome. Part of personal development is recognising what you actually need. We maintain referral pathways and will support you in finding the right fit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Session Zero Reflection Map */}
      <section className="mkt-section mkt-section--off-white">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">Prepare with Reflection</div>
            <h2>Session Zero — a first conversation on paper.</h2>
            <p>
              You don't need to answer these before the call. They are offered so you
              can arrive with something already in mind — not a polished answer,
              just an honest starting point.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680 }}>
            {[
              {
                n: '01',
                title: 'What brings you here?',
                prompt: 'Not the full story. Just the thing that made you consider reaching out. One or two sentences is enough.',
              },
              {
                n: '02',
                title: 'Current life context',
                prompt: 'Briefly — what is currently happening in the main areas of your life? Work, family, faith, health, relationships. What does this season look like?',
              },
              {
                n: '03',
                title: 'What feels unclear?',
                prompt: 'Where do you notice confusion, stuckness, or a sense that something is unresolved — even if you can\'t fully name it yet?',
              },
              {
                n: '04',
                title: 'What have you tried?',
                prompt: 'What has helped so far, and what hasn\'t? You don\'t need to have tried anything formal. Just what you\'ve noticed.',
              },
              {
                n: '05',
                title: 'What would progress look like?',
                prompt: 'Not the final destination. Just a sense of what a shift in the right direction would feel like — even if it\'s small.',
              },
            ].map(q => (
              <div key={q.n} style={{
                background: 'var(--cream)', border: '1px solid var(--line)',
                borderLeft: '3px solid var(--gold)',
                padding: '22px 26px',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--gold)' }}>{q.n}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--navy)', margin: 0 }}>
                    {q.title}
                  </h3>
                </div>
                <p style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65, margin: 0,
                }}>
                  {q.prompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next step CTAs — Calendly embed removed */}
      <section className="section-cta">
        <div className="eyebrow">Begin Here</div>
        <h2>Begin with a free conversation.</h2>
        <p>
          To begin, create a free profile and we'll be in touch to arrange your first conversation.
          Prefer to talk first? Reach out directly.
        </p>
        <div className="cta-btns">
          <Link to="/referral" className="btn btn-gold">Create Your Profile</Link>
          <Link to="/contact" className="btn btn-ghost">Get in Touch</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
