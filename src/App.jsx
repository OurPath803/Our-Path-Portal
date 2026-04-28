import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MentorRoute from './components/MentorRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import SessionZero from './pages/SessionZero'
import Dashboard from './pages/Dashboard'
import Journal from './pages/Journal'
import Sessions from './pages/Sessions'
import BetweenSessions from './pages/BetweenSessions'
import Notes from './pages/Notes'
import Rhythms from './pages/Rhythms'
import Settings from './pages/Settings'

import MentorDashboard from './pages/mentor/MentorDashboard'
import MentorNotes from './pages/mentor/MentorNotes'
import MentorJournal from './pages/mentor/MentorJournal'
import MentorApplications from './pages/mentor/MentorApplications'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/session-zero" element={<SessionZero />} />
          <Route path="/rhythms" element={<Rhythms />} />

          {/* Protected portal — mentees */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
          <Route path="/between" element={<ProtectedRoute><BetweenSessions /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Mentor only */}
          <Route path="/mentor" element={<MentorRoute><MentorDashboard /></MentorRoute>} />
          <Route path="/mentor/notes/:menteeId" element={<MentorRoute><MentorNotes /></MentorRoute>} />
          <Route path="/mentor/journal/:menteeId" element={<MentorRoute><MentorJournal /></MentorRoute>} />
          <Route path="/mentor/applications" element={<MentorRoute><MentorApplications /></MentorRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
