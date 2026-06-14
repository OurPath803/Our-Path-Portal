import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

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

const DIRECTOR_NAV = [
  { to: '/director',            ico: '◈', label: 'Overview' },
  { to: '/mentor',              ico: '◐', label: 'Mentor console' },
  { to: '/mentor/applications', ico: '◇', label: 'Applications' },
  { to: '/blog',                ico: '◆', label: 'Reading' },
  { to: '/settings',            ico: '◌', label: 'Settings' },
]

// Logo lockup — links back to the public home page. Uses horizontal light-on-dark
// logo with typographic fallback if the asset is missing.
function Logo() {
  const [imgFailed, setImgFailed] = useState(false)
  const inner = imgFailed
    ? <div className="logo">OurPath<span> Guidance</span></div>
    : (
      <div className="logo logo-img">
        <img
          src="/ourpath-horizontal-light.png"
          alt="OurPath Guidance"
          onError={() => setImgFailed(true)}
        />
      </div>
    )
  return (
    <Link to="/" style={{ textDecoration: 'none', borderBottom: 'none' }}>
      {inner}
    </Link>
  )
}

function NavItems({ onClose }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const isDirector = profile?.role === 'director'
  const isStaff = profile?.role === 'mentor' || profile?.role === 'admin'
  const NAV = isDirector ? DIRECTOR_NAV : isStaff ? MENTOR_NAV : MENTEE_NAV
  const [rhythm, setRhythm] = useState(null)

  useEffect(() => {
    if (!user || isStaff || isDirector) return
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
  }, [user, isStaff])

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'You'
  const lastName = profile?.full_name?.split(' ').slice(1).join(' ')

  return (
    <>
      <Logo />

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
        <div className="who">{firstName} {lastName ? lastName[0] + '.' : ''}</div>
        <div className="role">
          {profile?.role === 'admin'
            ? 'Admin'
            : profile?.role === 'director'
              ? 'Director'
              : profile?.role === 'mentor'
                ? 'Mentor'
                : (rhythm
                    ? `${rhythm.charAt(0).toUpperCase() + rhythm.slice(1)} rhythm · with Ustadh Shakil`
                    : 'No rhythm yet · with Ustadh Shakil')}
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

export default function Sidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <aside className="sidebar">
        <NavItems />
      </aside>

      <div className="mobile-top-bar">
        <Logo />
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
