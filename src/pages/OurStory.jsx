import { Link } from 'react-router-dom'
import MarketingHeader from '../components/MarketingHeader'
import Footer from '../components/Footer'

export default function OurStory() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <MarketingHeader />

      {/* Hero */}
      <section className="story-hero">
        <div className="eyebrow">Our Story</div>
        <h1>Built from the gap between managing and growing.</h1>
        <p>
          A low-level confusion about direction. A sense of moving without really choosing.
          You know what you want. But not how to move towards it without losing yourself.
        </p>
      </section>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-num">10+</div>
          <div className="stat-label">Years in pastoral &amp; community work</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">3</div>
          <div className="stat-label">Disciplines in one framework</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">1</div>
          <div className="stat-label">Gap that kept reappearing</div>
        </div>
      </div>

      {/* Founder */}
      <section className="story-founder">
        <div className="founder-text">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Where It Came From</div>
          <h2>Ustadh Shakil Moazzem</h2>
          <p>
            OurPath grew out of more than a decade of pastoral and community work — a consistent
            gap kept appearing between the people I was sitting with and the resources available to them.
          </p>
          <p>
            Therapy addressed pathology. Coaching targeted performance. Neither touched the quieter
            questions: who am I becoming? What does this season require of me? How do I move from
            managing to genuinely growing?
          </p>
          <p>
            OurPath is a structured, methodology-driven response to that gap — drawing on Islamic
            psychospiritual tradition, developmental psychology, and over ten years of lived
            pastoral work with young adults and professionals.
          </p>
        </div>
        <div className="founder-quote">
          <blockquote>
            "When you discover your path, you stop being lost to all the others."
          </blockquote>
          <cite>— Ustadh Shakil Moazzem · OurPath Guidance</cite>
        </div>
      </section>

      {/* What We Hold to Be True */}
      <section className="beliefs-section">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">Our Convictions</div>
            <h2>What we hold to be true.</h2>
          </div>
          <div className="beliefs-grid">
            <div className="belief-card">
              <h3>People are capable of more than they're currently expressing</h3>
              <p>Not because they lack effort, but because effort without orientation scatters. The work is to find the centre and route everything through it.</p>
            </div>
            <div className="belief-card">
              <h3>Clarity is a discipline, not a gift</h3>
              <p>It doesn't arrive. It's built through consistent reflective practice — asking the honest question, sitting with the answer, and choosing from there.</p>
            </div>
            <div className="belief-card">
              <h3>The Islamic tradition has answers the modern world has lost</h3>
              <p>Concepts like maqāṣid, fiṭra, tazkiyya — these are frameworks for human flourishing that predate and outlast the current moment's vocabulary.</p>
            </div>
            <div className="belief-card">
              <h3>Development is non-clinical but not superficial</h3>
              <p>Personal development has been colonised by quick wins and surface optimisation. Real development is slower, deeper, and more honest than that.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-cta">
        <div className="eyebrow">Begin Here</div>
        <h2>If this sounds like where you are — that's the point.</h2>
        <p>Start with a free 20-minute conversation. No commitment. Just an honest introduction.</p>
        <div className="cta-btns">
          <Link to="/referral" className="btn btn-gold">Book a Free Conversation</Link>
          <Link to="/triage-call" className="btn btn-ghost">Explore Mentoring</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
