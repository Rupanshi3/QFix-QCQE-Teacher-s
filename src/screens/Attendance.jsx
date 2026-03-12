import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CaretLeft, MagnifyingGlass } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { showToast } from '../components/Toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { allStudents } from '../data/seed'

export default function Attendance() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { getClassById, getAttendanceForClass, saveAttendance } = useApp()

  const cls = getClassById(classId)
  const savedAttendance = getAttendanceForClass(classId)

  const [attendance, setAttendance] = useState(() =>
    Object.fromEntries(allStudents.map(s => [s.id, savedAttendance[s.id] || 'present']))
  )
  const [search, setSearch] = useState('')
  const [hasChange, setHasChange] = useState(false)

  if (!cls) return null

  const toggle = (id) => {
    setAttendance(prev => ({ ...prev, [id]: prev[id] === 'present' ? 'absent' : 'present' }))
    setHasChange(true)
  }

  const handleSave = () => {
    saveAttendance(classId, attendance)
    setHasChange(false)
    showToast('✓ Attendance saved')
    navigate(`/workspace/${classId}`)
  }

  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.includes(search)
  )

  const presentCount = Object.values(attendance).filter(v => v === 'present').length
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length
  const total = allStudents.length

  return (
    <div className="h-full flex flex-col bg-stone-50">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-3 pb-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-muted transition-colors"
          aria-label="Back"
        >
          <CaretLeft size={20} color="var(--color-foreground)" weight="bold" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-semibold text-foreground truncate">{cls.displayName}</h1>
          <p className="text-[13px] text-muted-foreground">Attendance · Today</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChange}
          className="text-[15px] font-semibold px-3 py-1.5 rounded-lg transition-all active:opacity-70 disabled:opacity-30 text-primary"
        >
          Save
        </button>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-3 flex gap-3 bg-card border-b border-border">
        <div className="flex items-center justify-center bg-success-muted rounded-lg px-3 py-2.5 flex-1">
          <span className="text-[15px] font-semibold text-success">{presentCount}/{total} Present</span>
        </div>
        <div className="flex items-center justify-center bg-error-muted rounded-lg px-3 py-2.5 flex-1">
          <span className="text-[15px] font-semibold text-error">{absentCount}/{total} Absent</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2.5">
          <MagnifyingGlass size={16} color="var(--color-muted-foreground)" />
          <label htmlFor="search-students" className="sr-only">Search students</label>
          <Input
            id="search-students"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or roll no."
            className="flex-1 text-[15px] border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
          />
        </div>
      </div>

      {/* Student list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <ul className="flex flex-col gap-3 list-none">
          {filtered.map(student => {
            const isPresent = attendance[student.id] === 'present'
            return (
              <li key={student.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarFallback className="text-[13px] font-bold bg-brand-tint text-primary">
                    {student.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground truncate">{student.name}</p>
                  <p className="text-[13px] text-muted-foreground">Roll {student.roll}</p>
                </div>
                <button
                  onClick={() => toggle(student.id)}
                  className={`w-11 h-11 rounded-full text-white text-[13px] font-bold active:scale-95 transition-all flex-shrink-0 ${
                    isPresent ? 'bg-success' : 'bg-error'
                  }`}
                  aria-label={`Mark ${student.name} as ${isPresent ? 'absent' : 'present'}`}
                >
                  {isPresent ? 'P' : 'A'}
                </button>
              </li>
            )
          })}
          <li className="text-[13px] text-muted-foreground text-center py-3">
            Showing {allStudents.length} of 32 students · seed data
          </li>
        </ul>
      </div>

      {/* Save button */}
      <div className="px-4 py-4 bg-card border-t border-border">
        <Button
          onClick={handleSave}
          disabled={!hasChange}
          className="w-full h-12 text-[15px] font-semibold rounded-lg disabled:opacity-40"
        >
          Save Attendance
        </Button>
      </div>
    </div>
  )
}
