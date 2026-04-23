import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { allStudents } from '../data/seed'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

const avatarAccentStyle = {
  backgroundColor: 'var(--color-avatar-accent)',
  color: 'var(--color-avatar-accent-foreground)',
}

export default function StudentsList() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { getClassById } = useApp()
  const [search, setSearch] = useState('')
  const cls = getClassById(classId)

  if (!cls) return null

  const filtered = allStudents.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.roll.includes(search)
  )

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="bg-card border-b border-border px-4 pt-3 pb-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} color="var(--color-foreground)" weight="bold" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-semibold text-foreground truncate">Students</h1>
          <p className="text-[13px] text-muted-foreground truncate">{cls.displayName}</p>
        </div>
      </div>

      <div className="px-4 py-3">
        <InputGroup className="h-11 rounded-lg bg-card border-border shadow-none">
          <InputGroupInput
            id="search-class-students"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students…"
            className="text-sm"
          />
          <InputGroupAddon>
            <MagnifyingGlass size={16} />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <ul className="flex flex-col gap-3 list-none">
          {filtered.map(student => (
            <li key={student.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarFallback className="text-[13px] font-bold" style={avatarAccentStyle}>
                  {student.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-foreground truncate">{student.name}</p>
                <p className="text-[13px] text-muted-foreground">Roll {student.roll}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                student.status === 'present'
                  ? 'bg-success-muted text-success'
                  : 'bg-error-muted text-error'
              }`}>
                {student.status === 'present' ? 'Present' : 'Absent'}
              </span>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-center py-12">
              <p className="text-[15px] text-muted-foreground">No students found</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
