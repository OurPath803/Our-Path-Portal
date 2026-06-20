import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Director-level guard.
// Roles allowed: admin, director.
// lead_mentor gets mentor console access but not this overview.
export default function DirectorRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="loading">Loading…</div>
  if (!user)   return <Navigate to="/login" replace />

  if (!['admin', 'director'].includes(profile?.role)) {
    return <Navigate to="/mentor" replace />
  }

  return children
}
