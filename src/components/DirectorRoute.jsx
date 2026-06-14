import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Director-only guard. Also allows admin for testing/oversight.
export default function DirectorRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="loading">Loading…</div>
  if (!user)   return <Navigate to="/login" replace />

  if (profile?.role !== 'director' && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
