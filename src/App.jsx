import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MentorRoute from './components/MentorRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import TriageCall from './pages/TriageCall'
import Dashboard from './pages/Dashboard'
import Journal from './pages/Journal'
import Sessions from './pages/Sessions'
import BetweenSessions from './pages/BetweenSessions'
import Notes from './pages/Notes'
import Rhythms from './pages/Rhythms'
import Settings from './pages/Settings'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import BarakahBase from './pages/BarakahBase'
import OurStory from './pages/OurStory'
import Workshops from './pages/Workshops'
import Contact from './pages/Contact'
import Referral from './pages/Referral'

import MentorDashboard from './pages/mentor/MentorDashboard'
import MentorNotes from './pages/mentor/MentorNotes'
import MentorJournal from './pages/mentor/MentorJournal'
import MentorManage from './pages/mentor/MentorManage'
import MentorApplications from './pages/mentor/MentorApplications'

import Training from './pages/Training'

import OCSCheckin from './pages/tools/OCSCheckin'
import PositionMap from './pages/tools/PositionMap'
import CostAudit from './pages/tools/CostAudit'
import IntegrationFilter from './pages/tools/IntegrationFilter'
import OrientationFramework from './pages/tools/OrientationFramework'
import NineDomains from './pages/tools/NineDomains'
import ProgressReview from './pages/tools/ProgressReview'
import ClarityMap from './pages/tools/ClarityMap'
import DecisionSheet from './pages/tools/DecisionSheet'
import EnergyAudit from './pages/tools/EnergyAudit'
import ValuesAlignment from './pages/tools/ValuesAlignment'

import Privacy from './pages/legal/Privacy'
import Terms from './pages/legal/Terms'
import Cookies from './pages/legal/Cookies'
import Safeguarding from './pages/legal/Safeguarding'

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
          <Route path="/triage-call" element={<TriageCall />} />
          {/* Old /session-zero URL — redirect to the new triage call page so any
              external links still work. */}
          <Route path="/session-zero" element={<Navigate to="/triage-call" replace />} />
          <Route path="/rhythms" element={<Rhythms />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/barakah-base" element={<BarakahBase />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/training" element={<Training />} />

          {/* Legal — public */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/safeguarding" element={<Safeguarding />} />

          {/* Protected portal — mentees */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
          <Route path="/between" element={<ProtectedRoute><BetweenSessions /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Gated tools */}
          <Route path="/tools/ocs-checkin"        element={<ProtectedRoute><OCSCheckin /></ProtectedRoute>} />
          <Route path="/tools/nine-domains"        element={<ProtectedRoute><NineDomains /></ProtectedRoute>} />
          <Route path="/tools/progress-review"     element={<ProtectedRoute><ProgressReview /></ProtectedRoute>} />
          <Route path="/tools/clarity-map"         element={<ProtectedRoute><ClarityMap /></ProtectedRoute>} />
          <Route path="/tools/decision-sheet"      element={<ProtectedRoute><DecisionSheet /></ProtectedRoute>} />
          <Route path="/tools/energy-audit"        element={<ProtectedRoute><EnergyAudit /></ProtectedRoute>} />
          <Route path="/tools/values-alignment"    element={<ProtectedRoute><ValuesAlignment /></ProtectedRoute>} />
          <Route path="/tools/position-map"        element={<ProtectedRoute><PositionMap /></ProtectedRoute>} />
          <Route path="/tools/cost-audit"          element={<ProtectedRoute><CostAudit /></ProtectedRoute>} />
          <Route path="/tools/integration-filter"  element={<ProtectedRoute><IntegrationFilter /></ProtectedRoute>} />
          <Route path="/tools/orientation"         element={<ProtectedRoute><OrientationFramework /></ProtectedRoute>} />

          {/* Mentor only */}
          <Route path="/mentor" element={<MentorRoute><MentorDashboard /></MentorRoute>} />
          <Route path="/mentor/notes/:menteeId" element={<MentorRoute><MentorNotes /></MentorRoute>} />
          <Route path="/mentor/journal/:menteeId" element={<MentorRoute><MentorJournal /></MentorRoute>} />
          <Route path="/mentor/manage/:menteeId" element={<MentorRoute><MentorManage /></MentorRoute>} />
          <Route path="/mentor/applications" element={<MentorRoute><MentorApplications /></MentorRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
