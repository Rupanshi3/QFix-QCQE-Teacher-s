import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom'
import { Agentation } from 'agentation'
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
import StudentsList from './screens/StudentsList'
import ScheduleView from './screens/ScheduleView'
import Reports from './screens/Reports'
import TimetableBuilder from './screens/TimetableBuilder'
import StaffDirectory from './screens/StaffDirectory'
import { getLocationDepth } from './lib/pageTransitions'

function ProtectedRoute({ children }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/" replace />
  return children
}

function RouteTree({ location }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute><ScheduleView /></ProtectedRoute>} />
      <Route path="/schedule/timetable" element={<ProtectedRoute><TimetableBuilder /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/staff-directory" element={<ProtectedRoute><StaffDirectory /></ProtectedRoute>} />
      <Route path="/workspace/:classId" element={<ProtectedRoute><ClassWorkspace /></ProtectedRoute>} />
      <Route path="/attendance/:classId" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/students/:classId" element={<ProtectedRoute><StudentsList /></ProtectedRoute>} />
      <Route path="/assignment/:assignmentId" element={<ProtectedRoute><AssignmentDetail /></ProtectedRoute>} />
      <Route path="/communication" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
      <Route path="/channel/:channelId" element={<ProtectedRoute><ChannelFeed /></ProtectedRoute>} />
      <Route path="/my-classes" element={<ProtectedRoute><MyClasses /></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute><AssignmentsTab /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AppRoutes() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const previousLocationRef = useRef(location)
  const [renderedLocation, setRenderedLocation] = useState(location)
  const [transition, setTransition] = useState(null)

  useEffect(() => {
    const previousLocation = previousLocationRef.current
    if (location.key === previousLocation.key) return

    const previousDepth = getLocationDepth(previousLocation)
    const currentDepth = getLocationDepth(location)
    const isForward = currentDepth > previousDepth
    const isBack = currentDepth < previousDepth

    const frameId = window.requestAnimationFrame(() => {
      if (isForward) {
        setTransition({
          kind: 'forward',
          baseLocation: previousLocation,
          overlayLocation: location,
        })
        return
      }

      if (isBack) {
        setRenderedLocation(location)
        setTransition({
          kind: 'back',
          baseLocation: location,
          overlayLocation: previousLocation,
        })
        return
      }

      setRenderedLocation(location)
      setTransition(null)
    })

    const timeoutId = isForward || isBack
      ? window.setTimeout(() => {
          setRenderedLocation(location)
          setTransition(null)
        }, 320)
      : null

    previousLocationRef.current = location

    return () => {
      window.cancelAnimationFrame(frameId)
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [location, navigationType])

  if (!transition) {
    return <RouteTree location={renderedLocation} />
  }

  return (
    <div className="route-stack">
      <div className="route-layer route-layer-base" aria-hidden="true">
        <RouteTree location={transition.baseLocation} />
      </div>
      <div
        key={`${transition.kind}-${transition.overlayLocation.key}`}
        className={`route-layer ${transition.kind === 'forward' ? 'route-layer-entering' : 'route-layer-exiting'}`}
      >
        <RouteTree location={transition.overlayLocation} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <>
          <PhoneFrame>
            <AppRoutes />
          </PhoneFrame>
          {import.meta.env.DEV && (
            <Agentation endpoint="http://localhost:4747" />
          )}
        </>
      </AppProvider>
    </BrowserRouter>
  )
}
