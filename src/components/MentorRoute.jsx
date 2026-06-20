import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function MentorRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Mentors, lead mentors, admins, and directors can all access mentor pages.
  if (!['mentor', 'lead_mentor', 'admin', 'director'].includes(profile?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
