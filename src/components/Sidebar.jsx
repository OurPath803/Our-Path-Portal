import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// ── Navigation sets per role/view ────────────────────────────────────────────

const MENTEE_NAV = [
  { to: '/dashboard', ico: '◐', label: 'Home' },
  { to: '/profile',   ico: '○', label: 'Profile' },
  { to: '/journal',   ico: '◇', label: 'Journal' },
  { to: '/sessions',  ico: '◈', label: 'Sessions' },
  { to: '/between',   ico: '◉', label: 'Between sessions' },
  { to: '/notes',     ico: '◎', label: 'Notes & commitments' },
  { to: '/rhythms',   ico: '◍', label: 'Rhythm & billing' },
  { to: '/blog',      ico: '◆', label: 'Reading' },
  { to: '/settings',  ico: '◌', label: 'Settings' },
]

const MENTOR_NAV = [
  { to: '/mentor',              ico: '◐', label: 'Mentees' },
  { to: '/between',             ico: '◉', label: 'Messages' },
  { to: '/mentor/applications', ico: '◇', label: 'Applications' },
  { to: '/blog',                ico: '◆', label: 'Reading' },
  { to: '/settings',            ico: '◌', label: 'Settings' },
]

// Lead mentor: caseload + applications + reading, no director overview
const LEAD_MENTOR_NAV = [
  { to: '/mentor',              ico: '◐', label: 'Mentees' },
  { to: '/between',             ico: '◉', label: 'Messages' },
  { to: '/mentor/applications', ico: '◇', label: 'Applications' },
  { to: '/blog',                ico: '◆', label: 'Reading' },
  { to: '/settings',            ico: '◌', label: 'Settings' },
]

// Director / admin: full platform overview
const DIRECTOR_NAV = [
  { to: '/director',            ico: '◈', label: 'Overview' },
  { to: '/mentor',              ico: '◐', label: 'Mentor console' },
  { to: '/between',             ico: '◉', label: 'Messages' },
  { to: '/mentor/applications', ico: '◇', label: 'Applications' },
  { to: '/blog',                ico: '◆', label: 'Reading' },
  { to: '/settings',            ico: '◌', label: 'Settings' },
]

// ── Role helpers ─────────────────────────────────────────────────────────────

function getRoleGroup(role) {
  if (role === 'admin' || role === 'director') return 'director'
  if (role === 'lead_mentor')                  return 'lead_mentor'
  if (role === 'mentor')                       return 'mentor'
  return 'mentee'
}

// The "home" route for each view
function homeFor(group, view) {
  if (group === 'director') return view === 'mentor' ? '/mentor' : '/director'
  if (group === 'lead_mentor') return '/mentor'
  if (group === 'mentor')   return '/mentor'
  return '/dashboard'
}

// ── Logo ─────────────────────────────────────────────────────────────────────

function Logo({ homePath }) {
  const [imgFailed, setImgFailed] = useState(false)
  return (
    <Link to={homePath} style={{ textDecoration: 'none', borderBottom: 'none' }}>
      {imgFailed ? (
        <div className="logo">OurPath<span> Guidance</span></div>
      ) : (
        <div className="logo logo-img">
          <img
            src="/ourpath-horizontal-light.png"
            alt="OurPath Guidance"
            onError={() => setImgFailed(true)}
          />
        </div>
      )}
    </Link>
  )
}

// ── View switcher (admin only) ────────────────────────────────────────────────
// Lets admin toggle between Director view and Mentor view without changing role.

function ViewSwitcher({ view, onChange }) {
  return (
    <div style={{
      display: 'flex',
      background: 'rgba(0,0,0,0.25)',
      borderRadius: 6,
      padding: 3,
      marginBottom: 10,
      gap: 2,
    }}>
      {[
        { key: 'director', label: 'Director' },
        { key: 'mentor',   label: 'Mentor' },
      ].map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          style={{
            flex: 1,
            padding: '5px 8px',
            borderRadius: 4,
            border: 'none',
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            fontFamily: 'var(--font-body)',
            transition: 'all 0.12s',
            background: view === key ? 'rgba(250,250,248,0.15)' : 'transparent',
            color: view === key ? 'var(--cream)' : 'rgba(250,250,248,0.45)',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ── Role badge ────────────────────────────────────────────────────────────────

function roleBadge(role) {
  const map = {
    admin:       'Admin · Director',
    director:    'Director',
    lead_mentor: 'Lead Mentor',
    mentor:      'Mentor',
  }
  return map[role] ?? ''
}

// ── Nav items ─────────────────────────────────────────────────────────────────

function NavItems({ onClose }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const group = getRoleGroup(profile?.role)
  const isAdmin = profile?.role === 'admin'

  // Admins can switch between director and mentor view
  const [view, setView] = useState(() => {
    return localStorage.getItem('op_admin_view') || 'director'
  })

  function handleViewChange(v) {
    setView(v)
    localStorage.setItem('op_admin_view', v)
    navigate(homeFor(group, v))
    if (onClose) onClose()
  }

  // Pick nav based on role group + view
  let NAV
  if (group === 'director') {
    NAV = view === 'mentor' ? MENTOR_NAV : DIRECTOR_NAV
  } else if (group === 'lead_mentor') {
    NAV = LEAD_MENTOR_NAV
  } else if (group === 'mentor') {
    NAV = MENTOR_NAV
  } else {
    NAV = MENTEE_NAV
  }

  const homePath = homeFor(group, view)

  // Rhythm label for mentee footer
  const [rhythm, setRhythm] = useState(null)
  useEffect(() => {
    if (!user || group !== 'mentee') return
    supabase
      .from('subscriptions')
      .select('rhythm, status')
      .eq('mentee_id', user.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.status === 'active') setRhythm(data.rhythm)
      })
  }, [user, group])

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'You'
  const lastName  = profile?.full_name?.split(' ').slice(1).join(' ')

  return (
    <>
      <Logo homePath={homePath} />

      {NAV.map(({ to, ico, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          onClick={onClose}
        >
          <span className="ico">{ico}</span>
          {label}
        </NavLink>
      ))}

      <div className="sidebar-foot">
        {/* View switcher — admin only */}
        {isAdmin && (
          <ViewSwitcher view={view} onChange={handleViewChange} />
        )}

        <div className="who">{firstName} {lastName ? lastName[0] + '.' : ''}</div>
        <div className="role">
          {group === 'mentee'
            ? (rhythm
                ? `${rhythm.charAt(0).toUpperCase() + rhythm.slice(1)} rhythm · with Ustadh Shakil`
                : 'No rhythm yet · with Ustadh Shakil')
            : roleBadge(profile?.role)}
          {isAdmin && view === 'mentor' && (
            <span style={{ display: 'block', fontSize: 10, opacity: 0.6, marginTop: 2 }}>
              Viewing as mentor
            </span>
          )}
        </div>
        <button
          onClick={handleSignOut}
          style={{
            marginTop: 12, background: 'transparent', color: 'rgba(250,250,248,0.5)',
            fontSize: 12, padding: 0, letterSpacing: '0.05em',
          }}
        >
          Sign out
        </button>
      </div>
    </>
  )
}

// ── Sidebar shell ─────────────────────────────────────────────────────────────

export default function Sidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <aside className="sidebar">
        <NavItems />
      </aside>

      <div className="mobile-top-bar">
        {/* Mobile logo links home — NavItems handles the home path */}
        <Link to="/" style={{ textDecoration: 'none', borderBottom: 'none' }}>
          <div className="logo">OurPath<span> Guidance</span></div>
        </Link>
        <button className="hamburger" onClick={() => setDrawerOpen(true)}>☰</button>
      </div>

      {drawerOpen && (
        <div className="mobile-drawer">
          <div className="mobile-drawer-inner">
            <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
            <NavItems onClose={() => setDrawerOpen(false)} />
          </div>
          <div className="mobile-drawer-overlay" onClick={() => setDrawerOpen(false)} />
        </div>
      )}
    </>
  )
}
