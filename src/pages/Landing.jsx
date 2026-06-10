import { Link } from 'react-router-dom'
import MarketingHeader from '../components/MarketingHeader'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <MarketingHeader />

      {/* Hero */}
      <section className="hero">
        <div className="eyebrow">Mentoring · Reflection · Orientation</div>
        <h1>Personal Development Through Guidance &amp; Mentoring</h1>
        <p className="lede">
          OurPath helps young adults take stock of where they are and decide where to go next.
          One-to-one mentoring and small workshops. It isn't therapy, and it isn't coaching.
          It's something quieter, and more honest.
        </p>
        <div className="hero-ctas">
          <Link to="/referral" className="btn btn-primary">Book a Free Conversation</Link>
          <Link to="/triage-call" className="btn btn-ghost">See How It Works</Link>
        </div>
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

      {/* Our Approach */}
      <section className="mkt-section mkt-section--off-white">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">Our Approach</div>
            <h2>Three commitments. One framework.</h2>
            <p>
              A structured approach to personal development, informed by Islamic scholarship
              and lived through honest conversation.
            </p>
          </div>
          <div className="approach-cards">
            <div className="approach-card">
              <div className="eyebrow">Clarity</div>
              <h3>See where you actually stand</h3>
              <p>Map your roles, distinguish what you chose from what you inherited.</p>
            </div>
            <div className="approach-card">
              <div className="eyebrow">Responsibility</div>
              <h3>Own what's genuinely yours</h3>
              <p>Release what isn't. Name the real cost of what you carry.</p>
            </div>
            <div className="approach-card">
              <div className="eyebrow">Orientation</div>
              <h3>Choose your direction deliberately</h3>
              <p>Identify what this season of life requires of you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pathways */}
      <section className="mkt-section" style={{ background: 'var(--cream)' }}>
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">How You Develop with OurPath</div>
            <h2>Three pathways.</h2>
          </div>
          <div className="pathways-grid">
            <div className="pathway-card">
              <div className="pathway-type">1-1 Mentoring · Guided</div>
              <h3>Personalised Sessions</h3>
              <p>Someone to hold the structure while you do the work.</p>
              <Link to="/triage-call" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>How it works →</Link>
            </div>
            <div className="pathway-card">
              <div className="pathway-type">Workshop Series · Group</div>
              <h3>4-Week Guided Experience</h3>
              <p>Small cohort. Structured reflective practice.</p>
              <Link to="/workshops" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>See the structure →</Link>
            </div>
            <div className="pathway-card">
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

      {/* We Meet You Where You Are */}
      <section className="mkt-section" style={{ background: 'var(--cream)' }}>
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">We Meet You Where You Are</div>
            <h2>Three starting points. One framework.</h2>
          </div>
          <div className="starting-grid">
            <div className="starting-card">
              <div className="starting-num">01</div>
              <h3>I'm doing everything right but I feel stuck.</h3>
              <p>Career, faith, relationships. It's all handled. Effort on its own isn't producing growth any more.</p>
              <Link to="/referral" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', borderColor: 'rgba(245,238,217,0.3)', color: 'var(--cream)' }}>Start a conversation →</Link>
            </div>
            <div className="starting-card">
              <div className="starting-num">02</div>
              <h3>I'm carrying more than I chose.</h3>
              <p>Roles and expectations accumulated before you could assess them. You need to name the cost.</p>
              <Link to="/referral" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', borderColor: 'rgba(245,238,217,0.3)', color: 'var(--cream)' }}>Start a conversation →</Link>
            </div>
            <div className="starting-card">
              <div className="starting-num">03</div>
              <h3>I know what I want but I can't move.</h3>
              <p>The destination is clear. The paralysis is seeing too many paths at once.</p>
              <Link to="/referral" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', borderColor: 'rgba(245,238,217,0.3)', color: 'var(--cream)' }}>Start a conversation →</Link>
            </div>
          </div>
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
            <a href="https://qiman.co.uk" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Visit website →</a>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-cta">
        <div className="eyebrow">Start Your Development</div>
        <h2>Ready to move from managing to growing?</h2>
        <p>Book a free 20-minute conversation. There's no commitment. It's just a chance to talk.</p>
        <div className="cta-btns">
          <Link to="/referral" className="btn btn-primary">Book a Free Conversation</Link>
          <Link to="/referral" className="btn btn-ghost">Submit a Referral</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
