/**
 * Nine Reflection Domains — Tool 03
 *
 * A way of looking at life as a whole, rather than reducing everything to a
 * single problem. Uses the canonical OurPath REFLECTION_DOMAINS constant.
 *
 * For each domain, the client reflects on:
 *   – What does this domain look like for you right now?
 *   – Where does it need attention?
 *   – What is it asking of you?
 *
 * ProtectedRoute required.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { REFLECTION_DOMAINS } from '../../lib/constants/frameworks'

const DOMAIN_PROMPTS = {
  'Identity & Origin':       'Who are you, beyond the roles you play? What does your origin — family, community, heritage — give you and cost you?',
  'Values & Conviction':     'What do you actually believe? Where do your values hold firm, and where are they under pressure?',
  'Purpose & Direction':     'What does this season seem to be asking of you? Where are you moving, and where are you drifting?',
  'Relationships & Community': 'Who do you lean on, and who leans on you? Where do your relationships give life, and where do they drain it?',
  'Work & Contribution':     'What are you contributing through your work? Where does it feel meaningful, and where does it feel hollow?',
  'Inner State & Spiritual Life': 'How is your inner life? What is the quality of your connection to Allah, to yourself, to what matters?',
  'Obstacles & Patterns':    'What keeps reappearing? What patterns do you recognise — in your responses, your avoidances, your choices?',
  'Growth & Learning':       'What are you learning right now? What is this season teaching you, whether you chose it or not?',
  'Legacy & Contribution':   'What do you want to leave behind? What kind of presence do you want to have been in the lives of others?',
}

export default function NineDomains() {
  const [answers, setAnswers] = useState({})
  const [expanded, setExpanded] = useState(null)

  function setAnswer(domain, val) {
    setAnswers(a => ({ ...a, [domain]: val }))
  }

  function toggle(domain) {
    setExpanded(e => e === domain ? null : domain)
  }

  const filled = REFLECTION_DOMAINS.filter(d => answers[d]?.trim()).length

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">

          <div className="journal-head">
            <div className="eyebrow">Tool 03 · Wholeness</div>
            <h1>Nine Reflection Domains</h1>
            <p className="pull">
              A way of looking at your life as a whole — not as a list of problems, but as
              nine territories, each with its own texture and demand.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 680 }}>
            {REFLECTION_DOMAINS.map((domain, i) => {
              const isOpen = expanded === domain
              const hasContent = !!answers[domain]?.trim()

              return (
                <div
                  key={domain}
                  style={{
                    border: `1px solid ${hasContent ? 'var(--gold)' : 'var(--line)'}`,
                    borderLeft: `3px solid ${hasContent ? 'var(--gold)' : 'var(--line)'}`,
                    borderRadius: 4,
                    background: 'var(--off-white)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => toggle(domain)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '16px 20px',
                      background: 'transparent', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontSize: 13,
                        color: 'var(--gold)', minWidth: 24,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontSize: 18,
                        color: 'var(--navy)', fontWeight: 500,
                      }}>
                        {domain}
                      </span>
                    </div>
                    <span style={{ fontSize: 14, color: 'var(--mute)', flexShrink: 0 }}>
                      {hasContent ? '✓' : (isOpen ? '▴' : '▾')}
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 20px 20px' }}>
                      <p style={{
                        fontFamily: 'var(--font-display)', fontStyle: 'italic',
                        fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.65,
                        margin: '0 0 14px',
                      }}>
                        {DOMAIN_PROMPTS[domain]}
                      </p>
                      <textarea
                        value={answers[domain] ?? ''}
                        onChange={e => setAnswer(domain, e.target.value)}
                        rows={5}
                        placeholder="Reflect honestly. What's true here, right now?"
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          fontFamily: 'var(--font-body)', fontSize: 15,
                          lineHeight: 1.7, resize: 'vertical',
                          border: '1px solid var(--line)', borderRadius: 4,
                          padding: '12px 14px', background: 'var(--cream)',
                          color: 'var(--charcoal)', outline: 'none',
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filled > 0 && (
            <div style={{
              maxWidth: 680, marginTop: 28,
              background: 'var(--navy)', color: 'var(--cream)',
              padding: '20px 24px', borderRadius: 4,
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--gold)' }}>
                {filled} of 9 domains reflected on.
              </span>
              <p style={{ fontSize: 13, color: 'rgba(245,238,217,0.65)', margin: '6px 0 0' }}>
                Share this with your mentor at your next session.
              </p>
            </div>
          )}

          <div style={{ marginTop: 32 }}>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back to dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
