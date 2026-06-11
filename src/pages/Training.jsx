/**
 * Training — Practitioner Pathway page.
 *
 * Public page. Uses handbook content from OurPath Developmental Model Handbook v1.0.
 * Five levels: Asas → Taalum → Tadbir → Tamkin → Irshal.
 */
import { Link } from 'react-router-dom'
import MarketingHeader from '../components/MarketingHeader'
import Footer from '../components/Footer'
import { PATHWAY_LEVELS } from '../lib/constants/frameworks'

const LEVEL_DETAILS = [
  {
    id: 'asas',
    description:
      'The foundational level establishes the intellectual and ethical architecture of OurPath practice. You will study the Tazkiyah Principle and the three stations of the nafs, the al-Masīr 6-phase Pathway Framework in theory, the OCS instrument and its five dimensions, and the non-clinical boundary — what developmental mentoring is and is not. No client contact at this level.',
    covers: [
      'al-Masīr Pathway Framework (6 phases)',
      'The three stations of the nafs',
      'OCS five dimensions and scoring protocol',
      'The Four Mentor Stances — conceptual',
      'Professional and non-clinical boundaries',
      'Session Zero protocol',
    ],
    assessment: 'Written framework assessment',
    duration: 'Self-paced · 4–6 weeks',
    outcome: 'Framework literacy and readiness for supervised observation.',
  },
  {
    id: 'taalum',
    description:
      'The learning level moves from theory to structured observation. You will develop working command of the Nine Reflection Domains, the Four Mentor Stances in practice, and the Digestion Framework. You will shadow two live sessions and begin your Reflective Portfolio under supervision.',
    covers: [
      'Nine Reflection Domains — primary lens and Islamic frame',
      'Four Mentor Stances in live practice',
      'The Digestion Framework (six-step sequence)',
      'Position Map assessment tool',
      'Mirror-Reading surface and pattern layers',
      'Supervised session observation (×2)',
    ],
    assessment: 'Reflective Portfolio commenced. Observation form completed.',
    duration: 'Supervised · 8–12 weeks',
    outcome: 'Supervised observation complete. Portfolio open and evidenced.',
  },
  {
    id: 'tadbir',
    description:
      'The practice level introduces an independent supervised caseload of two to four mentees. You will facilitate the Position Map, apply the Cost Audit and Integration Filter tools, and conduct sessions using the full session arc. Monthly supervision with a Level 5 practitioner.',
    covers: [
      'Independent supervised caseload (2–4 mentees)',
      'Position Map facilitation — four dimensions',
      'Cost Audit — six cost domains',
      'Integration Filter — six-question protocol',
      'Full session arc (Open → Distil → Commit → Close)',
      'Monthly case supervision',
    ],
    assessment: 'Portfolio assessed. Session Observation Form (Level 3). Competency in all four tools.',
    duration: 'Independent · 12–16 weeks',
    outcome: 'Full tool competency. Eligible for Level 4 advanced casework.',
  },
  {
    id: 'tamkin',
    description:
      'The consolidation level works with complexity. You will develop capacity to hold dual roles, navigate cultural and family dynamics, apply all three layers of Mirror-Reading, manage referral pathways, and co-facilitate group Gift Series sessions. Ends with a Viva assessment.',
    covers: [
      'Mirror-Reading — all three layers (Surface, Pattern, Depth)',
      'Advanced casework: cultural identity, family systems',
      'Mental health literacy and referral pathways',
      'Professional and spiritual boundaries under pressure',
      'Co-facilitation of group Gift Series sessions',
      'Viva Rubric assessment (four-band marking)',
    ],
    assessment: 'Viva assessment. Full certification for independent practice.',
    duration: 'Consolidated · 16–24 weeks',
    outcome: 'Certified practitioner. Authorised for independent unsupervised caseload.',
  },
  {
    id: 'irshal',
    description:
      'The transmission level is not a course — it is an ongoing vocation. You move from receiving developmental support to offering it: supervising Level 3–4 practitioners, facilitating training cohorts, deepening scholarly grounding in the Islamic psychospiritual tradition, and contributing to the OurPath knowledge base.',
    covers: [
      'Supervision of Level 3–4 practitioners',
      'Training facilitation and cohort leadership',
      'Scholarly deepening — primary classical sources',
      'Contribution to OurPath frameworks and knowledge base',
      'Legacy mapping and succession planning',
      'Ijazah track — scholarly authorisation pathway',
    ],
    assessment: 'Ongoing portfolio and peer review. No terminal assessment.',
    duration: 'Ongoing · supervised transmission',
    outcome: 'Authorisation to supervise and train. Entry to Ijazah track.',
  },
]

const FRAMEWORKS = [
  {
    name: 'al-Masīr',
    arabic: 'المسار',
    sub: '6-phase developmental pathway',
    desc: 'Orientation → Excavation → Clarification → Construction → Integration → Transmission. The structural spine of the OurPath model, sequencing developmental work from first contact to legacy.',
  },
  {
    name: 'OCS',
    arabic: 'أو سي إس',
    sub: 'OurPath Check-In Scale · 5 dimensions',
    desc: 'Clarity, Agency, Groundedness, Energy, Momentum — each scored 1–5 at every session, generating a longitudinal profile of the person\'s developmental state across the engagement.',
  },
  {
    name: 'Nine Reflection Domains',
    arabic: 'مجالات التأمل',
    sub: 'Primary territories of inquiry',
    desc: 'Identity & Origin, Values & Conviction, Purpose & Direction, Relationships, Work & Contribution, Inner State, Obstacles & Patterns, Growth & Learning, Legacy & Contribution.',
  },
  {
    name: 'Four Mentor Stances',
    arabic: 'المواقف الأربعة',
    sub: 'Shāhid · Mirʾā · Dalīl · Rafīq',
    desc: 'Witness, Mirror, Guide, Companion. Each stance is deployed in response to what the person needs in that moment — not a fixed role but a live, responsive orientation.',
  },
  {
    name: 'Position Map',
    arabic: 'خريطة الوضع',
    sub: 'Clarity · Commitment · Capacity · Context',
    desc: 'A four-dimension assessment tool that locates the person\'s developmental position at intake and at review. Guides the mentor\'s approach and phase assignment.',
  },
  {
    name: 'Mirror-Reading',
    arabic: 'القراءة الانعكاسية',
    sub: 'Surface · Pattern · Depth',
    desc: 'The practitioner\'s primary interpretive method. Grounded in the classical concept of the qalb as a mirror — three progressive layers from what is presented to what is beneath.',
  },
]

const SOURCES = [
  { title: 'Iḥyāʾ ʿUlūm al-Dīn', scholar: 'Imam al-Ghazali (d. 1111)', note: 'Core framework for nafs, qalb, and tazkiyah.' },
  { title: 'Madārij al-Sālikīn', scholar: 'Ibn al-Qayyim al-Jawziyya (d. 1350)', note: 'Primary source for the Phase Framework sequencing.' },
  { title: 'Minḥāj al-Qāṣidīn', scholar: 'Ibn Qudāma al-Maqdisī (d. 1223)', note: 'Foundation of the three-stage nafs framework.' },
  { title: 'Motivational Interviewing', scholar: 'Miller & Rollnick', note: 'Spirit of MI informs the mentor stance throughout.' },
  { title: 'Identity and the Life Cycle', scholar: 'Erik Erikson', note: 'Psychosocial stage theory — developmental arc framing.' },
  { title: "Man's Search for Meaning", scholar: 'Viktor Frankl', note: 'Logotherapy — Purpose as a primary developmental field.' },
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
          Progression requires demonstrated competency, not completion of content.
        </p>
        <Link to="/contact" className="btn btn-gold">Enquire About Training</Link>
        {/* Five ascending arcs — five practitioner levels, cream/gold on navy */}
        <svg
          aria-hidden="true"
          viewBox="0 0 220 120"
          fill="none"
          style={{ width: 220, height: 120, display: 'block', margin: '40px auto 0' }}
        >
          <path d="M 20 110 A 20 20 0 0 1 60 110" stroke="rgba(250,250,248,0.2)" strokeWidth="1.5"/>
          <path d="M 20 110 A 40 40 0 0 1 100 110" stroke="rgba(250,250,248,0.3)" strokeWidth="1.5"/>
          <path d="M 20 110 A 60 60 0 0 1 140 110" stroke="rgba(250,250,248,0.45)" strokeWidth="1.5"/>
          <path d="M 20 110 A 80 80 0 0 1 180 110" stroke="rgba(250,250,248,0.6)" strokeWidth="1.5"/>
          <path d="M 20 110 A 90 90 0 0 1 200 110" stroke="#C9A84C" strokeWidth="1.5"/>
          <line x1="0" y1="110" x2="220" y2="110" stroke="rgba(201,168,76,0.35)" strokeWidth="1"/>
          <circle cx="40" cy="90" r="2" fill="rgba(201,168,76,0.5)"/>
          <circle cx="60" cy="70" r="2" fill="rgba(201,168,76,0.65)"/>
          <circle cx="80" cy="50" r="2" fill="rgba(201,168,76,0.8)"/>
          <circle cx="100" cy="30" r="2" fill="rgba(201,168,76,0.9)"/>
          <circle cx="110" cy="20" r="3.5" fill="#C9A84C"/>
        </svg>
      </section>

      {/* Five Levels */}
      <section className="mkt-section mkt-section--off-white">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">The Pathway</div>
            <h2>Five levels of practitioner formation.</h2>
            <p>
              Each level builds on the last. Progression is by demonstrated competency —
              assessment-gated, not clock-gated.
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
                  }}
                >
                  {/* Level header */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '72px 1fr',
                    gap: '0 24px', marginBottom: 16,
                  }}>
                    <div style={{ textAlign: 'center', paddingTop: 2 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 38,
                        color: 'var(--gold)', lineHeight: 1,
                      }}>
                        {String(lvl.level).padStart(2, '0')}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        display: 'flex', alignItems: 'baseline',
                        gap: 12, flexWrap: 'wrap', marginBottom: 4,
                      }}>
                        <h3 style={{
                          fontFamily: 'var(--font-display)', fontSize: 22,
                          color: 'var(--navy)', margin: 0, fontWeight: 600,
                        }}>
                          {lvl.label}
                        </h3>
                        <span style={{
                          fontSize: 13, color: 'var(--mute)',
                          fontFamily: 'var(--font-body)', letterSpacing: '0.04em',
                        }}>
                          {lvl.arabic}
                        </span>
                      </div>
                      <p style={{
                        fontSize: 14, color: 'var(--charcoal)',
                        lineHeight: 1.7, margin: 0,
                      }}>
                        {detail.description}
                      </p>
                    </div>
                  </div>

                  {/* Covers + meta */}
                  <div style={{
                    marginLeft: 96, display: 'grid',
                    gridTemplateColumns: '1fr 1fr', gap: '16px 32px',
                  }}>
                    <div>
                      <div style={{
                        fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: 'var(--mute)', fontFamily: 'var(--font-body)', marginBottom: 8,
                      }}>
                        What this level covers
                      </div>
                      <ul style={{
                        margin: 0, padding: 0, listStyle: 'none',
                        display: 'flex', flexDirection: 'column', gap: 5,
                      }}>
                        {detail.covers.map(c => (
                          <li key={c} style={{
                            display: 'flex', gap: 8, alignItems: 'flex-start',
                            fontSize: 13, color: 'var(--charcoal)', lineHeight: 1.5,
                          }}>
                            <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }}>—</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <div style={{
                          fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                          color: 'var(--mute)', fontFamily: 'var(--font-body)', marginBottom: 4,
                        }}>Duration</div>
                        <div style={{ fontSize: 13, color: 'var(--charcoal)' }}>{detail.duration}</div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                          color: 'var(--mute)', fontFamily: 'var(--font-body)', marginBottom: 4,
                        }}>Assessment</div>
                        <div style={{ fontSize: 13, color: 'var(--charcoal)' }}>{detail.assessment}</div>
                      </div>
                      <div style={{
                        padding: '10px 14px',
                        borderLeft: '2px solid var(--gold)',
                        background: 'rgba(201,168,76,0.06)',
                        fontSize: 13,
                        fontStyle: 'italic',
                        color: 'var(--navy)',
                        fontFamily: 'var(--font-display)',
                        lineHeight: 1.5,
                      }}>
                        {detail.outcome}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Frameworks you will master */}
      <section className="mkt-section">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">The Frameworks</div>
            <h2>Six instruments. One integrated model.</h2>
            <p>
              Every level builds deeper fluency in the same set of tools.
              By Level 5, these are not techniques — they are orientations.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
            marginTop: 36,
          }}>
            {FRAMEWORKS.map(fw => (
              <div key={fw.name} style={{
                background: 'var(--off-white)',
                border: '1px solid var(--line)',
                borderTop: '2px solid var(--gold)',
                borderRadius: 4,
                padding: '20px 22px',
              }}>
                <div style={{ marginBottom: 10 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 600,
                    fontSize: 18, color: 'var(--navy)', marginBottom: 2,
                  }}>
                    {fw.name}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--mute)', letterSpacing: '0.04em',
                    fontFamily: 'var(--font-body)',
                  }}>
                    {fw.sub}
                  </div>
                </div>
                <p style={{
                  fontSize: 13, color: 'var(--charcoal)',
                  lineHeight: 1.65, margin: 0,
                }}>
                  {fw.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Convergence / tradition */}
      <section className="mkt-section mkt-section--navy">
        <div className="section-inner">
          <div className="section-lead">
            <div className="eyebrow">The Tradition Behind the Training</div>
            <h2>Grounded in scholarship. Shaped by practice.</h2>
            <p>
              The Mentor Practitioner Pathway draws from the Islamic tradition of tarbiyya —
              formative guidance — and integrates it with contemporary developmental science.
              Both traditions are studied at their primary sources. The programme teaches
              the convergence, not the compromise.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 14,
            marginTop: 32,
          }}>
            {SOURCES.map(s => (
              <div key={s.title} style={{
                background: 'rgba(245,238,217,0.06)',
                border: '1px solid rgba(245,238,217,0.15)',
                borderRadius: 4,
                padding: '16px 18px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                  fontSize: 15, color: 'var(--cream)', marginBottom: 3,
                }}>
                  {s.title}
                </div>
                <div style={{
                  fontSize: 11, color: 'var(--gold)',
                  letterSpacing: '0.04em', marginBottom: 6,
                }}>
                  {s.scholar}
                </div>
                <div style={{
                  fontSize: 12, color: 'rgba(245,238,217,0.65)', lineHeight: 1.5,
                }}>
                  {s.note}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              'Islamic psychospiritual tradition',
              'al-Masīr developmental framework',
              'OCS assessment instruments',
              'Supervised reflective practice',
              'Scholarly mentorship (tarbiyya)',
              'Contemporary developmental science',
            ].map(tag => (
              <span
                key={tag}
                style={{
                  background: 'rgba(201,168,76,0.15)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: 'var(--gold)',
                  borderRadius: 20,
                  padding: '6px 16px',
                  fontSize: 12,
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

      {/* How progression works */}
      <section className="mkt-section mkt-section--off-white">
        <div className="section-inner" style={{ maxWidth: 820 }}>
          <div className="section-lead">
            <div className="eyebrow">Progression</div>
            <h2>Competency-gated, not clock-gated.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
            {[
              {
                n: '01',
                title: 'Assessment before advancement',
                body: 'Each level ends with a formal assessment — written at Level 1, portfolio-based at Levels 2–3, and Viva at Levels 4–5. Time in the level is secondary to demonstrated competency.',
              },
              {
                n: '02',
                title: 'Reflective Portfolio throughout',
                body: 'The Reflective Portfolio opens at Level 2 and runs through to certification. It follows the Gibbs/Kolb reflective cycle and maps directly onto the Muhasaba practice at the heart of the OurPath model.',
              },
              {
                n: '03',
                title: 'Supervision at every level',
                body: 'Levels 2–5 involve formal supervision with a qualified OurPath practitioner. Supervision is the primary vehicle of learning — not content delivery.',
              },
              {
                n: '04',
                title: 'Calibrated entry',
                body: 'Applicants are assessed before enrolment to determine the appropriate starting level. Prior experience in pastoral, therapeutic, or educational roles is considered. Some applicants begin at Level 2 or 3.',
              },
            ].map(item => (
              <div key={item.n} style={{
                display: 'flex', gap: 20, alignItems: 'flex-start',
                background: 'var(--cream)', border: '1px solid var(--line)',
                padding: '20px 24px', borderRadius: 4,
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 28,
                  color: 'var(--gold)', lineHeight: 1, flexShrink: 0, paddingTop: 2,
                }}>
                  {item.n}
                </div>
                <div>
                  <h4 style={{
                    fontFamily: 'var(--font-display)', fontSize: 17,
                    color: 'var(--navy)', margin: '0 0 6px',
                  }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: 14, color: 'var(--charcoal)', lineHeight: 1.7, margin: 0 }}>
                    {item.body}
                  </p>
                </div>
              </div>
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
          The next intake is limited. Get in touch to discuss whether you are a good fit
          and which level to begin at.
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
