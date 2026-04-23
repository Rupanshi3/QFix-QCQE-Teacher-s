import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CaretDown, MagnifyingGlass } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { showToast } from '../components/Toast'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { allStudents } from '../data/seed'

const ATTENDANCE_PERIODS = [
  'Today',
  'This week',
  'This month',
  'Current semester',
  'Academic year',
]

const ATTENDANCE_HISTORY_BY_PERIOD = {
  Today: [
    { label: 'Mon', value: 86 },
    { label: 'Tue', value: 92 },
    { label: 'Wed', value: 88 },
    { label: 'Thu', value: 84 },
    { label: 'Fri', value: 80 },
  ],
  'This week': [
    { label: 'W1', value: 82 },
    { label: 'W2', value: 87 },
    { label: 'W3', value: 90 },
    { label: 'W4', value: 84 },
  ],
  'This month': [
    { label: 'Jan', value: 84 },
    { label: 'Feb', value: 88 },
    { label: 'Mar', value: 86 },
    { label: 'Apr', value: 91 },
  ],
  'Current semester': [
    { label: 'Unit 1', value: 83 },
    { label: 'Unit 2', value: 85 },
    { label: 'Unit 3', value: 89 },
    { label: 'Unit 4', value: 87 },
    { label: 'Unit 5', value: 90 },
  ],
  'Academic year': [
    { label: 'Term 1', value: 84 },
    { label: 'Term 2', value: 88 },
    { label: 'Term 3', value: 91 },
  ],
}

export default function Attendance() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { getClassById, getAttendanceForClass, saveAttendance } = useApp()

  const cls = getClassById(classId)
  const savedAttendance = getAttendanceForClass(classId)

  const [search, setSearch] = useState('')
  const [attendancePeriod, setAttendancePeriod] = useState('Today')
  const [editableAttendance, setEditableAttendance] = useState(() =>
    Object.fromEntries(allStudents.map(s => [s.id, savedAttendance[s.id] || 'present']))
  )
  const [hasChange, setHasChange] = useState(false)
  const isMarkMode = searchParams.get('mode') === 'mark'

  if (!cls) return null

  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.includes(search)
  )

  const attendance = useMemo(
    () => (
      isMarkMode
        ? editableAttendance
        : Object.fromEntries(allStudents.map(s => [s.id, savedAttendance[s.id] || 'present']))
    ),
    [editableAttendance, isMarkMode, savedAttendance]
  )
  const presentCount = Object.values(attendance).filter(v => v === 'present').length
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length
  const total = allStudents.length
  const attendanceRate = Math.round((presentCount / total) * 100)
  const overviewBars = ATTENDANCE_HISTORY_BY_PERIOD[attendancePeriod] || ATTENDANCE_HISTORY_BY_PERIOD.Today
  const studentRows = filtered.map((student, index) => {
    const isPresent = attendance[student.id] === 'present'
    const studentPercentage = Math.max(
      62,
      Math.min(98, attendanceRate + ((index % 5) * 4 - 8))
    )

    return {
      ...student,
      isPresent,
      studentPercentage,
      trendLabel: isPresent ? 'Present in latest class' : 'Absent in latest class',
    }
  })

  const toggleAttendance = (studentId) => {
    setEditableAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }))
    setHasChange(true)
  }

  const handleSave = () => {
    saveAttendance(classId, editableAttendance)
    setHasChange(false)
    showToast('Attendance saved')
    navigate(`/workspace/${classId}`)
  }

  return (
    <div className="h-full flex flex-col bg-stone-50">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-3 pb-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-muted transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} color="var(--color-foreground)" weight="bold" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-semibold text-foreground truncate">{cls.displayName}</h1>
        </div>
        {isMarkMode && (
          <button
            onClick={handleSave}
            disabled={!hasChange}
            className="text-[15px] font-semibold px-3 py-1.5 rounded-lg transition-all active:opacity-70 disabled:opacity-30 text-primary"
          >
            Save
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {isMarkMode ? (
          <section className="pt-4">
            <div className="rounded-2xl border border-border bg-card px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Today&apos;s marking
                </p>
                <p className="text-[24px] font-bold leading-none text-foreground">{presentCount}/{total}</p>
              </div>
            </div>
          </section>
        ) : (
        <section className="pt-4">
          <div className="w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-11 w-full items-center justify-between rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-muted-foreground active:text-primary">
                  <span>{attendancePeriod}</span>
                  <CaretDown size={12} weight="bold" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {ATTENDANCE_PERIODS.map(period => (
                  <DropdownMenuItem
                    key={period}
                    onSelect={() => setAttendancePeriod(period)}
                    className={period === attendancePeriod ? 'text-primary font-semibold' : ''}
                  >
                    {period}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3 rounded-2xl border border-border bg-card px-4 py-4">
            <p className="text-[16px] font-semibold text-muted-foreground">
              {attendanceRate}% overall attendance
            </p>
            <div className="mt-4 rounded-xl border border-border/70 bg-stone-50 px-3 py-3">
              <div className="flex h-28 items-end gap-3 border-b border-dashed border-border/80 pb-2">
              {overviewBars.map(bar => (
                  <div key={bar.label} className="flex h-full flex-1 items-end">
                    <div
                      className="w-full rounded-sm bg-primary"
                      style={{ height: `${bar.value}%` }}
                    />
                  </div>
              ))}
              </div>
              <div className="mt-2 flex items-start gap-3">
                {overviewBars.map(bar => (
                  <div key={bar.label} className="flex flex-1 flex-col items-center text-center">
                    <p className="text-[12px] font-semibold text-foreground">{bar.value}%</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{bar.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        )}

        <div className="my-5 h-px bg-border" />

        <div className="pb-3">
        <InputGroup className="h-11 rounded-lg bg-card border-border shadow-none">
          <label htmlFor="search-students" className="sr-only">Search students</label>
          <InputGroupInput
            id="search-students"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or roll no."
            className="text-sm"
          />
          <InputGroupAddon>
            <MagnifyingGlass size={16} />
          </InputGroupAddon>
        </InputGroup>
        </div>

        <section>
          <div className="flex items-center justify-between gap-3 pb-3">
            <h2 className="text-[16px] font-bold text-foreground">
              {isMarkMode ? 'Mark absences' : 'Student-wise attendance'}
            </h2>
            <p className="text-[12px] text-muted-foreground">{studentRows.length} students</p>
          </div>
          <ul className="list-none divide-y divide-border rounded-2xl border border-border bg-card">
          {studentRows.map(student => {
            return (
              <li key={student.id} className="px-4 py-3 flex items-center gap-3">
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarFallback
                    className="text-[13px] font-bold"
                    style={{ backgroundColor: 'var(--color-avatar-accent)', color: 'var(--color-avatar-accent-foreground)' }}
                  >
                    {student.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground truncate">{student.name}</p>
                  <p className="text-[13px] text-muted-foreground">
                    Roll {student.roll}
                  </p>
                </div>
                {isMarkMode ? (
                  <button
                    type="button"
                    onClick={() => toggleAttendance(student.id)}
                    className={`min-w-[84px] h-9 rounded-full px-3 text-[12px] font-bold transition-all active:scale-95 ${
                      student.isPresent
                        ? 'bg-success-muted text-success'
                        : 'bg-error-muted text-error'
                    }`}
                    aria-label={`Mark ${student.name} as ${student.isPresent ? 'absent' : 'present'}`}
                  >
                    {student.isPresent ? 'Present' : 'Absent'}
                  </button>
                ) : (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[13px] font-bold text-foreground">
                      {student.studentPercentage}%
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">overall</p>
                  </div>
                )}
              </li>
            )
          })}
          <li className="text-[13px] text-muted-foreground text-center py-3">
            Showing {allStudents.length} of 32 students · seed data
          </li>
          </ul>
        </section>
      </div>
      {isMarkMode && (
        <div className="px-4 py-4 bg-card border-t border-border">
          <Button
            onClick={handleSave}
            disabled={!hasChange}
            className="w-full h-12 text-[15px] font-semibold rounded-lg disabled:opacity-40"
          >
            Save Attendance
          </Button>
        </div>
      )}
    </div>
  )
}
