import { createContext, useContext, useState, useCallback } from 'react'
import {
  teachers,
  allStudents,
  schoolClasses,
  collegeBatches,
  schoolAssignments,
  collegeAssignments,
  classSyllabus,
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
  const [syllabusState, setSyllabusState] = useState({
    school: Object.fromEntries(
      Object.entries(classSyllabus.school).map(([k, v]) => [k, v.map(item => ({ ...item }))])
    ),
    college: Object.fromEntries(
      Object.entries(classSyllabus.college).map(([k, v]) => [k, v.map(item => ({ ...item }))])
    ),
  })
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

  const rescheduleClass = useCallback((classId, schedule) => {
    const role = classId.startsWith('sc-') ? 'school' : 'college'
    const rescheduledTo = { ...schedule }
    setClassesState(prev => {
      const update = (list) => list.map(c => c.id === classId ? { ...c, rescheduledTo } : c)
      return { ...prev, [role]: update(prev[role]) }
    })

    const cls = [...classesState.school, ...classesState.college].find(c => c.id === classId)
    if (role === 'college' && cls?.channelId) {
      const title = `Class rescheduled to ${schedule.day}, ${schedule.time}`
      const subtitle = [
        schedule.date ? `Date: ${schedule.date}` : '',
        schedule.room ? `Room: ${schedule.room}` : '',
        schedule.note || '',
      ].filter(Boolean).join(' · ')
      const post = {
        id: `post-reschedule-${Date.now()}`,
        author: currentUser?.name || 'Teacher',
        authorInitial: (currentUser?.name || 'T')[0],
        time: 'Just now',
        date: new Date().toISOString().split('T')[0],
        content: title,
        title,
        subtitle,
        type: 'reschedule',
        schedule: rescheduledTo,
        reactions: 0,
      }
      setChannelsState(prev => ({
        ...prev,
        [cls.channelId]: {
          ...prev[cls.channelId],
          posts: [post, ...(prev[cls.channelId]?.posts || [])],
          unread: (prev[cls.channelId]?.unread || 0) + 1,
        },
      }))
    }
  }, [classesState, currentUser])

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
        date: new Date().toISOString().split('T')[0],
        content: newAssignment.title,
        title: newAssignment.title,
        subtitle: newAssignment.description || '',
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

  const getSyllabusForClass = useCallback((classId) => {
    const role = classId.startsWith('sc-') ? 'school' : 'college'
    return syllabusState[role][classId] || []
  }, [syllabusState])

  const addSyllabusItem = useCallback((classId, item) => {
    const role = classId.startsWith('sc-') ? 'school' : 'college'
    const newItem = {
      id: `syl-${Date.now()}`,
      ...item,
    }
    setSyllabusState(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [classId]: [newItem, ...(prev[role][classId] || [])],
      },
    }))
    return newItem
  }, [])

  // ── Channels ─────────────────────────────────────────────────────────────────
  const getChannelOrder = useCallback(() => {
    if (!currentUser) return []
    return currentUser.role === 'school' ? schoolChannelOrder : collegeChannelOrder
  }, [currentUser])

  const getChannel = useCallback((channelId) => {
    return channelsState[channelId]
  }, [channelsState])

  const addPost = useCallback((channelId, title, subtitle, metadata = {}) => {
    const post = {
      id: `post-${Date.now()}`,
      author: currentUser?.name || 'Teacher',
      authorInitial: (currentUser?.name || 'T')[0],
      time: 'Just now',
      date: new Date().toISOString().split('T')[0],
      content: title,
      title,
      subtitle: subtitle || '',
      type: 'text',
      reactions: 0,
      ...metadata,
    }
    setChannelsState(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        posts: [post, ...(prev[channelId]?.posts || [])],
      },
    }))
  }, [currentUser])

  const updatePost = useCallback((channelId, postId, updates) => {
    setChannelsState(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        posts: (prev[channelId]?.posts || []).map(post =>
          post.id === postId ? { ...post, ...updates } : post
        ),
      },
    }))
  }, [])

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
      rescheduleClass,
      getAttendanceForClass,
      saveAttendance,
      getAssignmentsForClass,
      addAssignment,
      deleteAssignment,
      getSyllabusForClass,
      addSyllabusItem,
      getChannelOrder,
      getChannel,
      addPost,
      updatePost,
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
