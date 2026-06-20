import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

// Base paths for static resource files
const GS     = '/gift-series/'
const COURSE = '/course/'

const TRAINING_RESOURCES = [
  { title: 'Course Handbook',       file: 'Handbook.html',             tag: 'Handbook' },
  { title: 'Reference Cards',       file: 'Reference-Cards.html',      tag: 'Reference' },
  { title: 'Observation Form',      file: 'Observation-Form.html',     tag: 'Form' },
  { title: 'Reflective Portfolio',  file: 'Reflective-Portfolio.html', tag: 'Portfolio' },
  { title: 'Viva Rubric',           file: 'Viva-Rubric.html',          tag: 'Rubric' },
  { title: 'GLH Log',               file: 'GLH-Log.html',              tag: 'Log' },
]

const GIFT_GROUPS = [
  {
    label: 'Programme materials',
    items: [
      { title: 'Facilitator Protocol', file: '03 Facilitator Protocol.html',  tag: 'Protocol' },
      { title: 'Participant Workbook',  file: '04 Participant Workbook.html',  tag: 'Workbook' },
      { title: 'Group Agreement',       file: '09 Group Agreement.html',       tag: 'Group' },
      { title: 'Outcome Forms',         file: '07 Outcome Forms.html',         tag: 'Forms' },
      { title: 'Safeguarding Card',     file: '08 Safeguarding Card.html',     tag: 'Safeguarding' },
      { title: 'Adaptation Guide',      file: '10 Adaptation Guide.html',      tag: 'Guide' },
    ],
  },
  {
    label: 'Session decks',
    items: [
      { title: 'Week 1 — Mind',  file: '05 Deck · Week 1 Mind.html',  tag: 'Deck' },
      { title: 'Week 2 — Heart', file: '05 Deck · Week 2 Heart.html', tag: 'Deck' },
      { title: 'Week 3 — Soul',  file: '05 Deck · Week 3 Soul.html',  tag: 'Deck' },
      { title: 'Week 4 — Hands', file: '05 Deck · Week 4 Hands.html', tag: 'Deck' },
    ],
  },
  {
    label: 'Run sheets',
    items: [
      { title: 'Week 1 — Mind',  file: '06 Run-Sheet · Week 1 Mind.html',  tag: 'Run sheet' },
      { title: 'Week 2 — Heart', file: '06 Run-Sheet · Week 2 Heart.html', tag: 'Run sheet' },
      { title: 'Week 3 — Soul',  file: '06 Run-Sheet · Week 3 Soul.html',  tag: 'Run sheet' },
      { title: 'Week 4 — Hands', file: '06 Run-Sheet · Week 4 Hands.html', tag: 'Run sheet' },
    ],
  },
]

// "3 days ago", "2 weeks ago", etc.
function relativeDate(iso) {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7)  return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

// Initials from a full name string
function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

// Small pill tag
function Pill({ children, variant = 'default' }) {
  const styles = {
    default: { background: 'var(--cream-deep)', color: 'var(--ink-soft)' },
    gold:    { background: 'rgba(201,168,76,0.15)', color: '#8B6914' },
    navy:    { background: 'var(--navy-light)', color: 'var(--navy)' },
  }
  return (
    <span style={{
      ...styles[variant],
      display: 'inline-block',
      fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
      textTransform: 'capitalize',
      padding: '3px 9px', borderRadius: 20,
      fontFamily: 'var(--font-body)',
    }}>
      {children}
    </span>
  )
}

// Stat summary chip at the top of the page
function StatChip({ value, label, highlight }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 18px',
      background: highlight ? 'var(--navy)' : 'var(--off-white)',
      border: `1px solid ${highlight ? 'var(--navy)' : 'var(--line)'}`,
      borderRadius: 8,
    }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1,
        color: highlight ? 'var(--gold)' : 'var(--navy)', fontWeight: 600,
      }}>
        {value}
      </span>
      <span style={{
        fontSize: 12, color: highlight ? 'rgba(250,250,248,0.7)' : 'var(--mute)',
        lineHeight: 1.3, fontWeight: 500,
      }}>
        {label}
      </span>
    </div>
  )
}

function ResourceLink({ href, tag, title }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 14px',
        background: 'var(--off-white)',
        border: '1px solid var(--line)',
        borderRadius: 4,
        textDecoration: 'none',
        fontFamily: 'var(--font-body)', fontSize: 13,
        color: 'var(--navy)',
        transition: 'border-color 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
    >
      <span style={{
        fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'var(--gold)', fontWeight: 600,
      }}>
        {tag}
      </span>
      {title}
      <span style={{ fontSize: 11, color: 'var(--mute)' }}>↗</span>
    </a>
  )
}

// Collapsible resources section — collapsed by default to keep the dashboard clean
function ResourcesSection({ label, eyebrow, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      marginTop: 36,
      border: '1px solid var(--line)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'var(--off-white)',
          border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--gold)', fontWeight: 600, marginBottom: 2,
          }}>
            {eyebrow}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 18,
            color: 'var(--navy)', fontWeight: 500,
          }}>
            {label}
          </div>
        </div>
        <span style={{ fontSize: 18, color: 'var(--mute)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          ↓
        </span>
      </button>
      {open && (
        <div style={{ padding: '20px', borderTop: '1px solid var(--line)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// Card for a single mentee — the core of the redesigned dashboard
function MenteeCard({ r }) {
  const rel = relativeDate(r.lastJournal)
  const needsAttention = r.unread > 0
  const journalOld = r.lastJournal
    ? (Date.now() - new Date(r.lastJournal).getTime()) > 14 * 86400000
    : true

  return (
    <div style={{
      background: 'var(--off-white)',
      border: `1px solid ${needsAttention ? 'var(--gold)' : 'var(--line)'}`,
      borderRadius: 8,
      overflow: 'hidden',
      transition: 'box-shadow 0.15s',
    }}>
      {/* Top row: avatar + name/email + meta + unread badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '18px 20px',
        flexWrap: 'wrap',
      }}>
        {/* Initials avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: needsAttention ? 'var(--gold)' : 'var(--navy)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600,
          color: needsAttention ? 'var(--navy)' : 'var(--cream)',
          letterSpacing: '0.03em',
        }}>
          {initials(r.full_name)}
        </div>

        {/* Name + email */}
        <div style={{ flex: '1 1 160px', minWidth: 0 }}>
          <div style={{
            fontWeight: 600, fontSize: 15, color: 'var(--navy)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {r.full_name ?? '—'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 1 }}>
            {r.email}
          </div>
        </div>

        {/* Meta: rhythm, sessions, last journal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {r.rhythm
            ? <Pill variant="navy">{r.rhythm}</Pill>
            : <Pill>No rhythm</Pill>
          }
          <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            <strong style={{ color: 'var(--navy)' }}>{r.sessions}</strong> session{r.sessions !== 1 ? 's' : ''}
          </span>
          {rel && (
            <span style={{
              fontSize: 12,
              color: journalOld ? '#8B6914' : 'var(--ink-soft)',
            }}>
              Journal: {rel}
            </span>
          )}
          {!r.lastJournal && (
            <span style={{ fontSize: 12, color: 'var(--mute)', fontStyle: 'italic' }}>
              No journal yet
            </span>
          )}
        </div>

        {/* Unread badge — right-aligned */}
        {needsAttention && (
          <div style={{
            marginLeft: 'auto', flexShrink: 0,
            background: 'var(--gold)', color: 'var(--navy)',
            fontWeight: 700, fontSize: 12, letterSpacing: '0.03em',
            padding: '5px 12px', borderRadius: 20,
            whiteSpace: 'nowrap',
          }}>
            {r.unread} unread
          </div>
        )}
      </div>

      {/* Bottom action row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px 14px',
        borderTop: '1px solid var(--line)',
        gap: 12, flexWrap: 'wrap',
        background: 'rgba(0,0,0,0.015)',
      }}>
        {/* Secondary links */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { label: 'Notes',   to: `/mentor/notes/${r.id}` },
            { label: 'Journal', to: `/mentor/journal/${r.id}` },
            { label: 'Manage',  to: `/mentor/manage/${r.id}` },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              style={{
                fontSize: 12, fontWeight: 500,
                color: 'var(--ink-soft)',
                padding: '5px 10px',
                borderRadius: 4,
                border: '1px solid var(--line)',
                background: 'var(--off-white)',
                textDecoration: 'none',
                borderBottom: 'none',
                transition: 'border-color 0.12s, color 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--navy)'; e.currentTarget.style.color = 'var(--navy)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-soft)' }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Primary CTA: Messages */}
        <Link
          to={`/between?with=${r.id}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 18px',
            background: needsAttention ? 'var(--navy)' : 'transparent',
            color: needsAttention ? 'var(--cream)' : 'var(--navy)',
            border: `1px solid var(--navy)`,
            borderRadius: 4,
            fontSize: 13, fontWeight: 500,
            textDecoration: 'none',
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--navy)'; e.currentTarget.style.color = 'var(--cream)' }}
          onMouseLeave={e => {
            if (!needsAttention) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--navy)' }
          }}
        >
          Messages
          {needsAttention && (
            <span style={{
              background: 'var(--gold)', color: 'var(--navy)',
              fontSize: 11, fontWeight: 700,
              padding: '1px 7px', borderRadius: 20,
            }}>
              {r.unread}
            </span>
          )}
        </Link>
      </div>
    </div>
  )
}

export default function MentorDashboard() {
  const { user, profile } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [topPosts, setTopPosts] = useState([])   // [{ slug, views }]

  useEffect(() => {
    if (!user) return
    loadMentees()
    supabase
      .from('blog_views')
      .select('slug, views')
      .order('views', { ascending: false })
      .limit(8)
      .then(({ data }) => setTopPosts(data ?? []))
  }, [user])

  async function loadMentees() {
    const isAdmin = profile?.role === 'admin'
    const query = supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'mentee')
      .order('created_at', { ascending: false })
    if (!isAdmin) query.eq('mentor_id', user.id)
    const { data: mentees } = await query

    if (!mentees || mentees.length === 0) {
      setRows([])
      setLoading(false)
      return
    }

    const ids = mentees.map(m => m.id)

    const [sessionsRes, unreadRes, journalsRes, subsRes] = await Promise.all([
      supabase.from('sessions').select('mentee_id').in('mentee_id', ids),
      supabase.from('messages').select('sender_id').eq('recipient_id', user.id).is('read_at', null).in('sender_id', ids),
      supabase.from('journal_entries').select('mentee_id, created_at').in('mentee_id', ids).order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('mentee_id, rhythm, status, started_at').in('mentee_id', ids).order('started_at', { ascending: false }),
    ])

    const sessionCount = {}
    ;(sessionsRes.data ?? []).forEach(s => {
      sessionCount[s.mentee_id] = (sessionCount[s.mentee_id] ?? 0) + 1
    })

    const unreadCount = {}
    ;(unreadRes.data ?? []).forEach(m => {
      unreadCount[m.sender_id] = (unreadCount[m.sender_id] ?? 0) + 1
    })

    const lastJournal = {}
    ;(journalsRes.data ?? []).forEach(j => {
      if (!lastJournal[j.mentee_id]) lastJournal[j.mentee_id] = j.created_at
    })

    const currentSub = {}
    ;(subsRes.data ?? []).forEach(s => {
      if (!currentSub[s.mentee_id]) currentSub[s.mentee_id] = s
    })

    const built = mentees.map(m => ({
      ...m,
      sessions:    sessionCount[m.id] ?? 0,
      unread:      unreadCount[m.id] ?? 0,
      lastJournal: lastJournal[m.id] ?? null,
      rhythm:      currentSub[m.id]?.status === 'active' ? currentSub[m.id]?.rhythm : null,
    }))

    // Sort: unread first, then by oldest journal (needs attention), then alphabetical
    built.sort((a, b) => {
      if (b.unread !== a.unread) return b.unread - a.unread
      if (!a.lastJournal && b.lastJournal) return -1
      if (a.lastJournal && !b.lastJournal) return 1
      if (a.lastJournal && b.lastJournal) return new Date(a.lastJournal) - new Date(b.lastJournal)
      return (a.full_name ?? '').localeCompare(b.full_name ?? '')
    })

    setRows(built)
    setLoading(false)
  }

  const firstName    = profile?.full_name?.split(' ')[0] ?? 'there'
  const totalUnread  = rows.reduce((s, r) => s + r.unread, 0)
  const totalSessions = rows.reduce((s, r) => s + r.sessions, 0)
  const activeRhythms = rows.filter(r => r.rhythm).length

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">

          {/* ── Header ── */}
          <div className="journal-head">
            <div className="eyebrow">Mentor console</div>
            <h1>Your caseload, {firstName}.</h1>
            <p className="pull">
              Sorted by who needs attention first. Unread messages appear at the top.
            </p>
          </div>

          {loading ? (
            <div className="loading">Loading mentees…</div>
          ) : rows.length === 0 ? (
            <div className="empty-state">
              No mentees assigned yet. New signups will appear here.
            </div>
          ) : (
            <>
              {/* ── Stat chips ── */}
              <div style={{
                display: 'flex', gap: 12, flexWrap: 'wrap',
                marginBottom: 28,
              }}>
                <StatChip value={rows.length} label={`mentee${rows.length !== 1 ? 's' : ''}`} />
                <StatChip value={totalUnread}  label="unread messages" highlight={totalUnread > 0} />
                <StatChip value={totalSessions} label="sessions total" />
                <StatChip value={activeRhythms} label="active rhythms" />
              </div>

              {/* ── Mentee cards ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rows.map(r => <MenteeCard key={r.id} r={r} />)}
              </div>
            </>
          )}

          {/* ── Resource sections (collapsed by default) ── */}
          <ResourcesSection
            eyebrow="Gift Series · Facilitator Resources"
            label="Programme materials"
          >
            {GIFT_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--mute)', marginBottom: 10,
                }}>
                  {group.label}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {group.items.map(item => (
                    <ResourceLink
                      key={item.file}
                      href={GS + encodeURIComponent(item.file)}
                      tag={item.tag}
                      title={item.title}
                    />
                  ))}
                </div>
              </div>
            ))}
          </ResourcesSection>

          <ResourcesSection
            eyebrow="Practitioner Training · Mentor Resources"
            label="Course materials"
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TRAINING_RESOURCES.map(item => (
                <ResourceLink
                  key={item.file}
                  href={COURSE + item.file}
                  tag={item.tag}
                  title={item.title}
                />
              ))}
            </div>
          </ResourcesSection>

          {topPosts.length > 0 && (
            <ResourcesSection
              eyebrow="Reading room · Engagement"
              label={`Blog reads — ${topPosts.reduce((s, p) => s + p.views, 0)} total`}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topPosts.map((p, i) => (
                  <div key={p.slug} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px',
                    background: i === 0 ? 'rgba(201,168,76,0.08)' : 'var(--cream)',
                    border: `1px solid ${i === 0 ? 'var(--gold)' : 'var(--line)'}`,
                    borderRadius: 6,
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: 'var(--mute)',
                      width: 20, textAlign: 'right', flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{
                      flex: 1, fontSize: 13, color: 'var(--navy)',
                      fontFamily: 'monospace', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {p.slug}
                    </span>
                    <span style={{
                      flexShrink: 0,
                      background: 'rgba(201,168,76,0.15)', color: '#8B6914',
                      fontSize: 12, fontWeight: 700,
                      padding: '2px 10px', borderRadius: 20,
                    }}>
                      {p.views} {p.views === 1 ? 'read' : 'reads'}
                    </span>
                  </div>
                ))}
              </div>
            </ResourcesSection>
          )}

        </div>
      </div>
    </div>
  )
}
