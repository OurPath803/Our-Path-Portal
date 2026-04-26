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

  if (profile?.role !== 'mentor') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
