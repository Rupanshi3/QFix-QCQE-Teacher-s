import { createContext, useContext, useState, useCallback } from 'react'
import {
  teachers,
  allStudents,
  schoolClasses,
  collegeBatches,
  schoolAssignments,
  collegeAssignments,
  channels,
  schoolChannelOrder,
  collegeChannelOrder,
} from '../data/seed'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [classesState, setClassesState] = useState({
    school: schoolClasses.map(c => ({ ...c })),
    college: collegeBatches.map(c => ({ ...c })),
  })
  const [assignmentsState, setAssignmentsState] = useState({
    school: Object.fromEntries(
      Object.entries(schoolAssignments).map(([k, v]) => [k, v.map(a => ({ ...a }))])
    ),
    college: Object.fromEntries(
      Object.entries(collegeAssignments).map(([k, v]) => [k, v.map(a => ({ ...a }))])
    ),
  })
  const [channelsState, setChannelsState] = useState(
    Object.fromEntries(
      Object.entries(channels).map(([k, v]) => [k, { ...v, posts: [...v.posts] }])
    )
  )
  // attendance state: { [classId]: { [studentId]: 'present'|'absent' } }
  const [attendanceState, setAttendanceState] = useState({})

  // ── Auth ────────────────────────────────────────────────────────────────────
  const login = useCallback((role, customName) => {
    const user = { ...teachers[role] }
    if (customName) user.name = customName
    setCurrentUser(user)
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
  }, [])

  const switchRole = useCallback((role) => {
    setCurrentUser({ ...teachers[role] })
  }, [])

  // ── Classes ─────────────────────────────────────────────────────────────────
  const getClasses = useCallback(() => {
    if (!currentUser) return []
    return currentUser.role === 'school'
      ? classesState.school
      : classesState.college
  }, [currentUser, classesState])

  const getClassById = useCallback((id) => {
    const all = [...classesState.school, ...classesState.college]
    return all.find(c => c.id === id)
  }, [classesState])

  const markAttendanceSaved = useCallback((classId) => {
    setClassesState(prev => {
      const update = (list) => list.map(c => c.id === classId ? { ...c, attendance: 'marked' } : c)
      return { school: update(prev.school), college: update(prev.college) }
    })
  }, [])

  // ── Attendance ───────────────────────────────────────────────────────────────
  const getAttendanceForClass = useCallback((classId) => {
    return attendanceState[classId] || Object.fromEntries(allStudents.map(s => [s.id, s.status]))
  }, [attendanceState])

  const saveAttendance = useCallback((classId, studentAttendance) => {
    setAttendanceState(prev => ({ ...prev, [classId]: { ...studentAttendance } }))
    markAttendanceSaved(classId)
  }, [markAttendanceSaved])

  // ── Assignments ──────────────────────────────────────────────────────────────
  const getAssignmentsForClass = useCallback((classId) => {
    const role = classId.startsWith('sc-') ? 'school' : 'college'
    return assignmentsState[role][classId] || []
  }, [assignmentsState])

  const addAssignment = useCallback((classId, assignment) => {
    const role = classId.startsWith('sc-') ? 'school' : 'college'
    const newAssignment = {
      id: `asgn-${Date.now()}`,
      classId,
      submitted: 0,
      total: 32,
      overdue: false,
      status: 'active',
      ...assignment,
    }
    setAssignmentsState(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [classId]: [newAssignment, ...(prev[role][classId] || [])],
      },
    }))
    // Also inject as assignment post into that class's channel
    const cls = [...classesState.school, ...classesState.college].find(c => c.id === classId)
    if (cls?.channelId) {
      const post = {
        id: `post-asgn-${Date.now()}`,
        author: currentUser?.name || 'Teacher',
        authorInitial: (currentUser?.name || 'T')[0],
        time: 'Just now',
        content: newAssignment.title,
        type: 'assignment',
        assignmentId: newAssignment.id,
        dueDate: newAssignment.dueDate,
        submitted: 0,
        total: newAssignment.total,
        reactions: 0,
      }
      setChannelsState(prev => ({
        ...prev,
        [cls.channelId]: {
          ...prev[cls.channelId],
          posts: [post, ...(prev[cls.channelId]?.posts || [])],
        },
      }))
    }
    return newAssignment
  }, [classesState, currentUser])

  const deleteAssignment = useCallback((classId, assignmentId) => {
    const role = classId.startsWith('sc-') ? 'school' : 'college'
    setAssignmentsState(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [classId]: (prev[role][classId] || []).filter(a => a.id !== assignmentId),
      },
    }))
  }, [])

  // ── Channels ─────────────────────────────────────────────────────────────────
  const getChannelOrder = useCallback(() => {
    if (!currentUser) return []
    return currentUser.role === 'school' ? schoolChannelOrder : collegeChannelOrder
  }, [currentUser])

  const getChannel = useCallback((channelId) => {
    return channelsState[channelId]
  }, [channelsState])

  const addPost = useCallback((channelId, content) => {
    const post = {
      id: `post-${Date.now()}`,
      author: currentUser?.name || 'Teacher',
      authorInitial: (currentUser?.name || 'T')[0],
      time: 'Just now',
      content,
      type: 'text',
      reactions: 0,
    }
    setChannelsState(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        posts: [post, ...(prev[channelId]?.posts || [])],
      },
    }))
  }, [currentUser])

  const markChannelRead = useCallback((channelId) => {
    setChannelsState(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        unread: 0,
      },
    }))
  }, [])

  return (
    <AppContext.Provider value={{
      currentUser,
      login,
      logout,
      switchRole,
      getClasses,
      getClassById,
      getAttendanceForClass,
      saveAttendance,
      getAssignmentsForClass,
      addAssignment,
      deleteAssignment,
      getChannelOrder,
      getChannel,
      addPost,
      markChannelRead,
      allStudents,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
