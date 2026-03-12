import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import PhoneFrame from './components/PhoneFrame'

import Login from './screens/Login'
import Home from './screens/Home'
import ClassWorkspace from './screens/ClassWorkspace'
import Attendance from './screens/Attendance'
import AssignmentDetail from './screens/AssignmentDetail'
import Communication from './screens/Communication'
import ChannelFeed from './screens/ChannelFeed'
import MyClasses from './screens/MyClasses'
import AssignmentsTab from './screens/AssignmentsTab'
import Profile from './screens/Profile'

function ProtectedRoute({ children }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/" replace />
  return children
}

function CollegeRoute({ children }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/" replace />
  if (currentUser.role !== 'college') return <Navigate to="/home" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/workspace/:classId" element={<ProtectedRoute><ClassWorkspace /></ProtectedRoute>} />
      <Route path="/attendance/:classId" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/assignment/:assignmentId" element={<ProtectedRoute><AssignmentDetail /></ProtectedRoute>} />
      <Route path="/communication" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
      <Route path="/channel/:channelId" element={<ProtectedRoute><ChannelFeed /></ProtectedRoute>} />
      <Route path="/my-classes" element={<CollegeRoute><MyClasses /></CollegeRoute>} />
      <Route path="/assignments" element={<CollegeRoute><AssignmentsTab /></CollegeRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <PhoneFrame>
          <AppRoutes />
        </PhoneFrame>
      </AppProvider>
    </BrowserRouter>
  )
}
