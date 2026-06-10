import { Link } from 'react-router-dom'
import MarketingHeader from '../components/MarketingHeader'
import Footer from '../components/Footer'
import { PATHWAY_LEVELS } from '../lib/constants/frameworks'

const LEVEL_DETAILS = [
  {
    focus: 'Foundational frameworks — al-Masīr, OCS, and the Four Mentor Stances. Understanding the difference between developmental guidance and therapy.',
    duration: 'Self-paced · 4–6 weeks',
    outcome: 'Framework literacy and readiness for supervised practice.',
  },
  {
    focus: 'Structured observation and supervised practice. The Nine Reflection Domains and how to move through them with a mentee.',
    duration: 'Supervised · 8–12 weeks',
    outcome: 'First supervised sessions completed with reflective portfolio.',
  },
  {
    focus: 'Independent caseload under light supervision. Position Map facilitation, Cost Audit and Integration Filter tools.',
    duration: 'Independent · 12–16 weeks',
    outcome: 'Competency in all four workshop tools. Portfolio assessed.',
  },
  {
    focus: 'Advanced casework. Handling complexity: dual roles, cultural dynamics, referral pathways, and professional boundaries.',
    duration: 'Consolidated · 16–24 weeks',
    outcome: 'Full certification for independent practice.',
  },
  {
    focus: 'Mentoring mentors. Training facilitation, cohort leadership, and scholarly deepening in the Islamic psychospiritual tradition.',
    duration: 'Ongoing · supervised transmission',
    outcome: 'Authorisation to supervise and train others within the pathway.',
  },
]

export default function Training() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <MarketingHeader />

      {/* Hero */}
      <section className="workshops-hero">
        <div className="eyebrow">Practitioner Training · Mentor Pathway</div>
        <h1>Five levels. One developmental arc.</h1>
        <p>
          The OurPath Mentor Practitioner Pathway trains developmental mentors in the
          al-Masīr framework — grounded in Islamic psychospiritual tradition and structured
          developmental science. Five levels from foundation to transmission.
        </p>
        <Link to="/contact" className="btn btn-gold">Enquire About Training</Link>
      </section>

      {/* Levels */}
      <section className="mkt-section mkt-section--off-white">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">The Pathway</div>
            <h2>Five levels of practitioner formation.</h2>
            <p>
              Each level builds on the last. Progression requires demonstrated competency,
              not just completion of content.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 40 }}>
            {PATHWAY_LEVELS.map((lvl, i) => {
              const detail = LEVEL_DETAILS[i]
              return (
                <div
                  key={lvl.id}
                  style={{
                    background: 'var(--cream)',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    padding: '28px 32px',
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    gap: '0 28px',
                  }}
                >
                  <div style={{ textAlign: 'center', paddingTop: 4 }}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 36,
                      color: 'var(--gold)',
                      lineHeight: 1,
                    }}>
                      {String(lvl.level).padStart(2, '0')}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap',
                      marginBottom: 6,
                    }}>
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 22,
                        color: 'var(--navy)',
                        margin: 0,
                        fontWeight: 600,
                      }}>
                        {lvl.label}
                      </h3>
                      <span style={{
                        fontSize: 13,
                        color: 'var(--mute)',
                        fontFamily: 'var(--font-body)',
                        letterSpacing: '0.04em',
                      }}>
                        {lvl.arabic}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 15,
                      color: 'var(--charcoal)',
                      lineHeight: 1.7,
                      margin: '0 0 10px',
                    }}>
                      {detail.focus}
                    </p>
                    <div style={{
                      display: 'flex', gap: 24, flexWrap: 'wrap',
                      fontSize: 13,
                      color: 'var(--mute)',
                      fontFamily: 'var(--font-body)',
                    }}>
                      <span>⟶ {detail.duration}</span>
                      <span style={{ color: 'var(--navy)', fontStyle: 'italic' }}>{detail.outcome}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Ethos block */}
      <section className="mkt-section mkt-section--navy">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">The Tradition Behind the Training</div>
            <h2>Grounded in scholarship. Shaped by practice.</h2>
            <p>
              The Mentor Practitioner Pathway draws from the Islamic tradition of tarbiyya —
              formative guidance — and integrates it with contemporary developmental science.
              It is not a coaching qualification. It is a formation pathway.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 32 }}>
            {[
              'Islamic psychospiritual tradition',
              'al-Masīr developmental framework',
              'OCS assessment tools',
              'Supervised clinical-adjacent practice',
              'Scholarly mentorship',
            ].map(tag => (
              <span
                key={tag}
                style={{
                  background: 'rgba(201,168,76,0.15)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: 'var(--gold)',
                  borderRadius: 20,
                  padding: '6px 16px',
                  fontSize: 13,
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '0.04em',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Non-clinical disclaimer */}
      <div style={{
        background: 'var(--cream)',
        borderTop: '1px solid var(--line)',
        padding: '20px 48px',
        textAlign: 'center',
        fontSize: 13,
        color: 'var(--mute)',
        fontFamily: 'var(--font-body)',
      }}>
        OurPath is non-clinical developmental mentoring, not therapy or medical treatment.
        The Practitioner Pathway does not confer clinical or therapeutic registration.
      </div>

      {/* CTA */}
      <section className="section-cta">
        <div className="eyebrow">Begin Your Formation</div>
        <h2>Interested in the pathway?</h2>
        <p>
          The next intake is limited. Get in touch to discuss whether you're a good fit and
          which level to begin at.
        </p>
        <div className="cta-btns">
          <Link to="/contact" className="btn btn-gold">Enquire About Training</Link>
          <Link to="/our-story" className="btn btn-ghost">Learn More About OurPath</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
