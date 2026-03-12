// ─── Teachers ───────────────────────────────────────────────────────────────
export const teachers = {
  school: {
    id: 'sunita',
    name: 'Sunita Sharma',
    email: 'sunita@govtschool.edu',
    phone: '+91 98234 10101',
    password: 'teacher123',
    role: 'school',
    roleLabel: 'School Teacher',
    institute: 'Govt. Higher Secondary School',
    city: 'Nagpur',
    adminName: 'Mr. Prakash Deshmukh',
  },
  college: {
    id: 'rahul',
    name: 'Rahul Desai',
    email: 'rahul@sies.edu',
    phone: '+91 98765 20202',
    password: 'teacher123',
    role: 'college',
    roleLabel: 'College Professor',
    institute: 'SIES College of Engineering',
    city: 'Pune',
    adminName: 'Dr. Meena Rao',
  },
}

// ─── Students (shared across all classes for prototype) ──────────────────────
export const allStudents = [
  { id: 1,  name: 'Aarav Sharma',  roll: '01', status: 'present' },
  { id: 2,  name: 'Priya Nair',    roll: '02', status: 'present' },
  { id: 3,  name: 'Rohan Mehta',   roll: '03', status: 'absent'  },
  { id: 4,  name: 'Sneha Patil',   roll: '04', status: 'present' },
  { id: 5,  name: 'Karan Singh',   roll: '05', status: 'present' },
  { id: 6,  name: 'Divya Iyer',    roll: '06', status: 'present' },
  { id: 7,  name: 'Amit Yadav',    roll: '07', status: 'absent'  },
  { id: 8,  name: 'Pooja Joshi',   roll: '08', status: 'present' },
  { id: 9,  name: 'Rahul Gupta',   roll: '09', status: 'present' },
  { id: 10, name: 'Meera Pillai',  roll: '10', status: 'present' },
]

// ─── School Classes (master list — times live in schoolDaySchedule) ──────────
// Color mapping: 6A=Green, 7A=Blue, 7B=Purple, 8C=Orange, 9A=Red
export const schoolClasses = [
  {
    id: 'sc-6a',
    subject: 'Mathematics',
    division: 'Class 6A',
    displayName: 'Mathematics · Class 6A',
    color: '#10B981',
    attendance: 'pending',
    totalStudents: 32,
    channelId: 'ch-6a',
  },
  {
    id: 'sc-7a',
    subject: 'Mathematics',
    division: 'Class 7A',
    displayName: 'Mathematics · Class 7A',
    color: '#3B82F6',
    attendance: 'marked',
    totalStudents: 34,
    channelId: 'ch-7a',
  },
  {
    id: 'sc-7b',
    subject: 'Mathematics',
    division: 'Class 7B',
    displayName: 'Mathematics · Class 7B',
    color: '#8B5CF6',
    attendance: 'pending',
    totalStudents: 33,
    channelId: 'ch-7b',
  },
  {
    id: 'sc-8c',
    subject: 'Mathematics',
    division: 'Class 8C',
    displayName: 'Mathematics · Class 8C',
    color: '#F97316',
    attendance: 'pending',
    totalStudents: 30,
    channelId: 'ch-8c',
  },
  {
    id: 'sc-9a',
    subject: 'Mathematics',
    division: 'Class 9A',
    displayName: 'Mathematics · Class 9A',
    color: '#EF4444',
    attendance: 'pending',
    totalStudents: 28,
    channelId: 'ch-9a',
  },
]

// ─── School Day Schedule ─────────────────────────────────────────────────────
// Each entry: { classId, startTime, endTime } or { type: 'lunch', startTime, endTime }
export const schoolDaySchedule = {
  Mon: [
    { classId: 'sc-7a', startTime: '09:15', endTime: '10:00' },
    { classId: 'sc-8c', startTime: '10:30', endTime: '11:15' },
    { type: 'lunch',    startTime: '12:30', endTime: '13:00' },
  ],
  Tue: [
    { classId: 'sc-6a', startTime: '09:15', endTime: '10:00' },
    { classId: 'sc-9a', startTime: '11:15', endTime: '12:00' },
    { type: 'lunch',    startTime: '12:30', endTime: '13:00' },
  ],
  Wed: [
    { classId: 'sc-7b', startTime: '09:15', endTime: '10:00' },
    { classId: 'sc-8c', startTime: '10:30', endTime: '11:15' },
    { type: 'lunch',    startTime: '12:30', endTime: '13:00' },
    { classId: 'sc-6a', startTime: '13:15', endTime: '14:00' },
  ],
  Thu: [
    { classId: 'sc-7a', startTime: '09:45', endTime: '10:30' },
    { classId: 'sc-9a', startTime: '11:30', endTime: '12:15' },
    { type: 'lunch',    startTime: '12:30', endTime: '13:00' },
  ],
  Fri: [
    { classId: 'sc-6a', startTime: '09:15', endTime: '10:00' },
    { type: 'lunch',    startTime: '12:30', endTime: '13:00' },
    { classId: 'sc-7b', startTime: '13:15', endTime: '14:00' },
  ],
}

// ─── College Batches (master list — times live in collegeDaySchedule) ─────────
// Color mapping: CSE First Year=Blue, CSE Second Year=Indigo, CSE Third Year=Teal
export const collegeBatches = [
  {
    id: 'cb-cse1-pf',
    subject: 'Programming Fundamentals',
    division: 'CSE First Year',
    displayName: 'Programming Fundamentals · CSE First Year',
    color: '#3B82F6',
    attendance: 'pending',
    totalStudents: 65,
    channelId: 'ch-cse1-pf',
    lastAttendance: 'Today',
    activeAssignments: 2,
  },
  {
    id: 'cb-cse2-ds',
    subject: 'Data Structures',
    division: 'CSE Second Year',
    displayName: 'Data Structures · CSE Second Year',
    color: '#6366F1',
    attendance: 'marked',
    totalStudents: 60,
    channelId: 'ch-cse2-ds',
    lastAttendance: 'Today',
    activeAssignments: 1,
  },
  {
    id: 'cb-cse2-algo',
    subject: 'Algorithms',
    division: 'CSE Second Year',
    displayName: 'Algorithms · CSE Second Year',
    color: '#6366F1',
    attendance: 'pending',
    totalStudents: 60,
    channelId: 'ch-cse2-algo',
    lastAttendance: 'Mar 5',
    activeAssignments: 1,
  },
  {
    id: 'cb-cse3-db',
    subject: 'Database Systems',
    division: 'CSE Third Year',
    displayName: 'Database Systems · CSE Third Year',
    color: '#14B8A6',
    attendance: 'pending',
    totalStudents: 55,
    channelId: 'ch-cse3-db',
    lastAttendance: 'Mar 4',
    activeAssignments: 1,
  },
  {
    id: 'cb-cse3-cn',
    subject: 'Computer Networks',
    division: 'CSE Third Year',
    displayName: 'Computer Networks · CSE Third Year',
    color: '#14B8A6',
    attendance: 'pending',
    totalStudents: 55,
    channelId: 'ch-cse3-cn',
    lastAttendance: 'Mar 3',
    activeAssignments: 0,
  },
  {
    id: 'cb-cse3-os',
    subject: 'Operating Systems',
    division: 'CSE Third Year',
    displayName: 'Operating Systems · CSE Third Year',
    color: '#14B8A6',
    attendance: 'pending',
    totalStudents: 55,
    channelId: 'ch-cse3-os',
    lastAttendance: 'Mar 2',
    activeAssignments: 1,
  },
]

// ─── College Day Schedule ────────────────────────────────────────────────────
export const collegeDaySchedule = {
  Mon: [
    { classId: 'cb-cse1-pf',   startTime: '09:00', endTime: '10:00' },
    { classId: 'cb-cse2-ds',   startTime: '10:30', endTime: '11:30' },
    { classId: 'cb-cse3-db',   startTime: '14:00', endTime: '15:00' },
  ],
  Tue: [
    { classId: 'cb-cse2-algo', startTime: '09:00', endTime: '10:00' },
    { classId: 'cb-cse1-pf',   startTime: '11:00', endTime: '12:00' },
    { classId: 'cb-cse3-cn',   startTime: '15:00', endTime: '16:00' },
  ],
  Wed: [
    { classId: 'cb-cse2-ds',   startTime: '09:00', endTime: '10:00' },
    { classId: 'cb-cse3-os',   startTime: '10:30', endTime: '11:30' },
    { classId: 'cb-cse1-pf',   startTime: '13:30', endTime: '14:30' },
  ],
  Thu: [
    { classId: 'cb-cse1-pf',   startTime: '09:00', endTime: '10:00' },
    { classId: 'cb-cse2-algo', startTime: '10:00', endTime: '11:00' },
    { classId: 'cb-cse3-db',   startTime: '11:30', endTime: '12:30' },
    { classId: 'cb-cse2-ds',   startTime: '14:30', endTime: '15:30' },
  ],
  Fri: [
    { classId: 'cb-cse2-ds',   startTime: '09:00', endTime: '10:00' },
    { classId: 'cb-cse1-pf',   startTime: '10:30', endTime: '11:30' },
    { classId: 'cb-cse3-cn',   startTime: '12:00', endTime: '13:00' },
    { classId: 'cb-cse2-algo', startTime: '14:00', endTime: '15:00' },
    { classId: 'cb-cse3-os',   startTime: '15:30', endTime: '16:30' },
  ],
}

// ─── School Assignments ───────────────────────────────────────────────────────
export const schoolAssignments = {
  'sc-6a': [
    {
      id: 'asgn-1',
      classId: 'sc-6a',
      title: 'Chapter 3 Practice Set',
      description: 'Solve problems 1–25 from Chapter 3.',
      dueDate: 'Mar 10',
      submitted: 8,
      total: 32,
      overdue: false,
    },
    {
      id: 'asgn-2',
      classId: 'sc-6a',
      title: 'Fractions Test Revision',
      description: null,
      dueDate: 'Mar 1',
      submitted: 28,
      total: 32,
      overdue: true,
    },
  ],
  'sc-7a': [
    {
      id: 'asgn-3',
      classId: 'sc-7a',
      title: 'Geometry Problems',
      description: null,
      dueDate: 'Mar 12',
      submitted: 20,
      total: 34,
      overdue: false,
    },
  ],
  'sc-7b': [
    {
      id: 'asgn-4',
      classId: 'sc-7b',
      title: 'Symmetry Worksheet',
      description: 'Complete the symmetry worksheet distributed in class.',
      dueDate: 'Mar 11',
      submitted: 15,
      total: 33,
      overdue: false,
    },
  ],
  'sc-8c': [
    {
      id: 'asgn-5',
      classId: 'sc-8c',
      title: 'Algebra Practice',
      description: null,
      dueDate: 'Mar 9',
      submitted: 12,
      total: 30,
      overdue: false,
    },
    {
      id: 'asgn-6',
      classId: 'sc-8c',
      title: 'Unit 4 Revision',
      description: null,
      dueDate: 'Feb 25',
      submitted: 30,
      total: 30,
      overdue: false,
      status: 'closed',
    },
  ],
  'sc-9a': [
    {
      id: 'asgn-7',
      classId: 'sc-9a',
      title: 'Quadratic Equations Set',
      description: null,
      dueDate: 'Mar 13',
      submitted: 5,
      total: 28,
      overdue: false,
    },
  ],
}

// ─── College Assignments ──────────────────────────────────────────────────────
export const collegeAssignments = {
  'cb-cse1-pf': [
    {
      id: 'casgn-1',
      classId: 'cb-cse1-pf',
      title: 'Lab Assignment 3 – Functions',
      description: 'Implement 5 programs using functions in C.',
      dueDate: 'Mar 10',
      submitted: 22,
      total: 65,
      overdue: false,
      status: 'active',
    },
    {
      id: 'casgn-2',
      classId: 'cb-cse1-pf',
      title: 'Recursion Problems',
      description: null,
      dueDate: 'Mar 14',
      submitted: 10,
      total: 65,
      overdue: false,
      status: 'active',
    },
  ],
  'cb-cse2-ds': [
    {
      id: 'casgn-3',
      classId: 'cb-cse2-ds',
      title: 'Linked List Implementation',
      description: null,
      dueDate: 'Mar 1',
      submitted: 38,
      total: 60,
      overdue: true,
      status: 'overdue',
    },
  ],
  'cb-cse2-algo': [
    {
      id: 'casgn-4',
      classId: 'cb-cse2-algo',
      title: 'Dynamic Programming Set',
      description: null,
      dueDate: 'Mar 12',
      submitted: 14,
      total: 60,
      overdue: false,
      status: 'active',
    },
  ],
  'cb-cse3-db': [
    {
      id: 'casgn-5',
      classId: 'cb-cse3-db',
      title: 'SQL Query Assignment',
      description: null,
      dueDate: 'Mar 11',
      submitted: 20,
      total: 55,
      overdue: false,
      status: 'active',
    },
  ],
  'cb-cse3-cn': [],
  'cb-cse3-os': [
    {
      id: 'casgn-6',
      classId: 'cb-cse3-os',
      title: 'Process Scheduling Simulation',
      description: null,
      dueDate: 'Mar 15',
      submitted: 8,
      total: 55,
      overdue: false,
      status: 'active',
    },
  ],
}

// ─── Assignment Submission Detail (demo data shown for any assignment) ────────
export const submissionDetail = {
  submitted: [
    { id: 1,  name: 'Aarav Sharma',  time: '2 hours ago' },
    { id: 2,  name: 'Priya Nair',    time: '3 hours ago' },
    { id: 6,  name: 'Divya Iyer',    time: 'Yesterday, 8:30 PM' },
    { id: 8,  name: 'Pooja Joshi',   time: 'Yesterday, 9:15 PM' },
    { id: 10, name: 'Meera Pillai',  time: 'Today, 7:45 AM' },
  ],
  pending: [
    { id: 3, name: 'Rohan Mehta',  roll: '03' },
    { id: 4, name: 'Sneha Patil',  roll: '04' },
    { id: 5, name: 'Karan Singh',  roll: '05' },
    { id: 7, name: 'Amit Yadav',   roll: '07' },
    { id: 9, name: 'Rahul Gupta',  roll: '09' },
  ],
}

// ─── Communication Channels ──────────────────────────────────────────────────
export const channels = {
  broadcast: {
    id: 'broadcast',
    name: 'Broadcast',
    readOnly: true,
    pinned: true,
    unread: 1,
    posts: [
      {
        id: 'bp-1',
        author: 'School Administration',
        authorInitial: 'A',
        time: '2 days ago',
        content: 'Annual Sports Day will be held on March 15th. All teachers are requested to help coordinate their respective classes.',
        type: 'text',
        reactions: 8,
      },
      {
        id: 'bp-2',
        author: 'Principal',
        authorInitial: 'P',
        time: '3 days ago',
        content: 'Reminder: All mid-term examination papers to be submitted to the exam cell by March 12th.',
        type: 'text',
        reactions: 5,
      },
    ],
  },

  // ── School channels ──────────────────────────────────────────────────────
  'ch-6a': {
    id: 'ch-6a',
    name: 'Mathematics · Class 6A',
    classId: 'sc-6a',
    readOnly: false,
    pinned: true,
    unread: 2,
    posts: [
      {
        id: 'p-6a-1',
        author: 'Sunita Sharma',
        authorInitial: 'S',
        time: '1 hour ago',
        content: 'Please bring your textbook tomorrow for the chapter test revision.',
        type: 'text',
        reactions: 4,
      },
    ],
  },
  'ch-7a': {
    id: 'ch-7a',
    name: 'Mathematics · Class 7A',
    classId: 'sc-7a',
    readOnly: false,
    pinned: false,
    unread: 0,
    posts: [
      {
        id: 'p-7a-1',
        author: 'Sunita Sharma',
        authorInitial: 'S',
        time: 'Yesterday',
        content: 'Great work on the chapter test everyone! Average score was 78%.',
        type: 'text',
        reactions: 15,
      },
    ],
  },
  'ch-7b': {
    id: 'ch-7b',
    name: 'Mathematics · Class 7B',
    classId: 'sc-7b',
    readOnly: false,
    pinned: false,
    unread: 0,
    posts: [
      {
        id: 'p-7b-1',
        author: 'Sunita Sharma',
        authorInitial: 'S',
        time: '2 days ago',
        content: 'Symmetry unit starts next Monday. Please review Chapter 9 over the weekend.',
        type: 'text',
        reactions: 6,
      },
    ],
  },
  'ch-8c': {
    id: 'ch-8c',
    name: 'Mathematics · Class 8C',
    classId: 'sc-8c',
    readOnly: false,
    pinned: false,
    unread: 3,
    posts: [
      {
        id: 'p-8c-1',
        author: 'Sunita Sharma',
        authorInitial: 'S',
        time: '3 days ago',
        content: 'Algebra unit starts next Monday. Please review Chapter 4 over the weekend.',
        type: 'text',
        reactions: 3,
      },
    ],
  },
  'ch-9a': {
    id: 'ch-9a',
    name: 'Mathematics · Class 9A',
    classId: 'sc-9a',
    readOnly: false,
    pinned: false,
    unread: 0,
    posts: [
      {
        id: 'p-9a-1',
        author: 'Sunita Sharma',
        authorInitial: 'S',
        time: 'Yesterday',
        content: 'Quadratic equations assignment is due this Friday. Submit in class.',
        type: 'text',
        reactions: 9,
      },
    ],
  },

  // ── College channels ─────────────────────────────────────────────────────
  'ch-cse1-pf': {
    id: 'ch-cse1-pf',
    name: 'Programming Fundamentals · CSE First Year',
    classId: 'cb-cse1-pf',
    readOnly: false,
    pinned: true,
    unread: 1,
    posts: [
      {
        id: 'p-cse1-1',
        author: 'Rahul Desai',
        authorInitial: 'R',
        time: '1 hour ago',
        content: 'Lab session rescheduled to Friday 2 PM. Check the updated timetable on the portal.',
        type: 'text',
        reactions: 6,
      },
    ],
  },
  'ch-cse2-ds': {
    id: 'ch-cse2-ds',
    name: 'Data Structures · CSE Second Year',
    classId: 'cb-cse2-ds',
    readOnly: false,
    pinned: false,
    unread: 5,
    posts: [
      {
        id: 'p-cse2-ds-1',
        author: 'Rahul Desai',
        authorInitial: 'R',
        time: '2 hours ago',
        content: 'Linked List assignment is overdue. Please submit by end of day or contact me.',
        type: 'text',
        reactions: 2,
      },
    ],
  },
  'ch-cse2-algo': {
    id: 'ch-cse2-algo',
    name: 'Algorithms · CSE Second Year',
    classId: 'cb-cse2-algo',
    readOnly: false,
    pinned: false,
    unread: 0,
    posts: [
      {
        id: 'p-cse2-algo-1',
        author: 'Rahul Desai',
        authorInitial: 'R',
        time: 'Yesterday',
        content: 'Dynamic programming module begins next week. Review recursion concepts before class.',
        type: 'text',
        reactions: 10,
      },
    ],
  },
  'ch-cse3-db': {
    id: 'ch-cse3-db',
    name: 'Database Systems · CSE Third Year',
    classId: 'cb-cse3-db',
    readOnly: false,
    pinned: false,
    unread: 0,
    posts: [
      {
        id: 'p-cse3-db-1',
        author: 'Rahul Desai',
        authorInitial: 'R',
        time: '2 days ago',
        content: 'SQL assignment uploaded to the portal. Deadline is March 11th.',
        type: 'text',
        reactions: 7,
      },
    ],
  },
  'ch-cse3-cn': {
    id: 'ch-cse3-cn',
    name: 'Computer Networks · CSE Third Year',
    classId: 'cb-cse3-cn',
    readOnly: false,
    pinned: false,
    unread: 0,
    posts: [],
  },
  'ch-cse3-os': {
    id: 'ch-cse3-os',
    name: 'Operating Systems · CSE Third Year',
    classId: 'cb-cse3-os',
    readOnly: false,
    pinned: false,
    unread: 2,
    posts: [
      {
        id: 'p-cse3-os-1',
        author: 'Rahul Desai',
        authorInitial: 'R',
        time: '3 days ago',
        content: 'Process scheduling simulation assignment posted. Deadline March 15th.',
        type: 'text',
        reactions: 4,
      },
    ],
  },
}

// ─── Channel order per role ───────────────────────────────────────────────────
export const schoolChannelOrder = ['broadcast', 'ch-6a', 'ch-7a', 'ch-7b', 'ch-8c', 'ch-9a']
export const collegeChannelOrder = [
  'broadcast',
  'ch-cse1-pf',
  'ch-cse2-ds',
  'ch-cse2-algo',
  'ch-cse3-db',
  'ch-cse3-cn',
  'ch-cse3-os',
]
