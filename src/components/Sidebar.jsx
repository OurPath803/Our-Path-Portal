import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const MENTEE_NAV = [
  { to: '/dashboard', ico: '◐', label: 'Home' },
  { to: '/journal',   ico: '◇', label: 'Journal' },
  { to: '/sessions',  ico: '◈', label: 'Sessions' },
  { to: '/between',   ico: '◉', label: 'Between sessions' },
  { to: '/notes',     ico: '◎', label: 'Notes & commitments' },
  { to: '/rhythms',   ico: '◍', label: 'Rhythm & billing' },
  { to: '/settings',  ico: '◌', label: 'Settings' },
]

const MENTOR_NAV = [
  { to: '/mentor',              ico: '◐', label: 'Mentees' },
  { to: '/between',             ico: '◉', label: 'Messages' },
  { to: '/mentor/applications', ico: '◇', label: 'Applications' },
  { to: '/settings',            ico: '◌', label: 'Settings' },
]

function NavItems({ onClose }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const isStaff = profile?.role === 'mentor' || profile?.role === 'admin'
  const NAV = isStaff ? MENTOR_NAV : MENTEE_NAV
  const [rhythm, setRhythm] = useState(null)

  // For mentees, load their current rhythm from the subscriptions table
  // (the source of truth for rhythm + active state).
  useEffect(() => {
    if (!user || isStaff) return
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
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : '?'

  return (
    <>
      <div className="logo">OurPath<span> ·</span></div>

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
            : profile?.role === 'mentor'
              ? 'Mentor'
              : (rhythm
                  ? `${rhythm.charAt(0).toUpperCase() + rhythm.slice(1)} rhythm · with Shakil`
                  : 'No rhythm yet · with Shakil')}
        </div>
        <button
          onClick={handleSignOut}
          style={{
            marginTop: 12, background: 'transparent', color: 'rgba(245,240,232,0.5)',
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
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <NavItems />
      </aside>

      {/* Mobile top bar */}
      <div className="mobile-top-bar">
        <div className="logo">OurPath<span> ·</span></div>
        <button className="hamburger" onClick={() => setDrawerOpen(true)}>☰</button>
      </div>

      {/* Mobile drawer */}
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
