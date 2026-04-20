import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass, CaretRight, TrendUp } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'
import { useChildLinkProps } from '../lib/pageTransitions'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

const ATTENDANCE_BY_CLASS = {
  'sc-6a': 78,
  'sc-7a': 91,
  'sc-7b': 86,
  'sc-8c': 80,
  'sc-9a': 74,
  'cb-cse1-pf': 82,
  'cb-cse2-ds': 88,
  'cb-cse2-algo': 79,
  'cb-cse3-db': 84,
  'cb-cse3-cn': 76,
  'cb-cse3-os': 81,
}

function parseNextDueDate(dueDate) {
  if (!dueDate) return null

  const parsed = new Date(`${dueDate}, ${new Date().getFullYear()} 23:59:59`)
  if (Number.isNaN(parsed.getTime())) return null

  const now = new Date()
  if (parsed < now) {
    parsed.setFullYear(parsed.getFullYear() + 1)
  }

  return parsed
}

function getCardTitle(displayName) {
  return displayName.split('·')[0].trim()
}

function getAssignmentSummary(assignments) {
  const activeAssignments = assignments.filter(assignment => assignment.status !== 'closed')
  if (activeAssignments.length === 0) {
    return {
      label: 'No assg.',
      className: 'bg-muted text-muted-foreground border border-border',
    }
  }

  const nextAssignment = activeAssignments
    .map(assignment => ({
      ...assignment,
      parsedDueDate: parseNextDueDate(assignment.dueDate),
    }))
    .filter(assignment => assignment.parsedDueDate)
    .sort((a, b) => a.parsedDueDate - b.parsedDueDate)[0]

  if (!nextAssignment) {
    return {
      label: `${activeAssignments.length} assg.`,
      className: 'bg-brand-tint text-primary border border-transparent',
    }
  }

  if (nextAssignment.dueDate === 'Mar 1') {
    return {
      label: `${activeAssignments.length} assg. · Due in 2 days`,
      className: 'bg-red-50 text-red-700 border border-red-200',
    }
  }

  if (nextAssignment.dueDate === 'Mar 12') {
    return {
      label: `${activeAssignments.length} assg. · Due in 6 days`,
      className: 'bg-amber-50 text-amber-700 border border-amber-200',
    }
  }

  const hoursUntilDue = (nextAssignment.parsedDueDate.getTime() - Date.now()) / (1000 * 60 * 60)

  if (hoursUntilDue < 24) {
    return {
      label: `${activeAssignments.length} assg. · Due ${nextAssignment.dueDate} within 24 hrs`,
      className: 'bg-red-50 text-red-700 border border-red-200',
    }
  }

  if (hoursUntilDue < 48) {
    return {
      label: `${activeAssignments.length} assg. · Due ${nextAssignment.dueDate} in under 2 days`,
      className: 'bg-amber-50 text-amber-700 border border-amber-200',
    }
  }

  return {
    label: `${activeAssignments.length} assg. · Next due ${nextAssignment.dueDate}`,
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  }
}

export default function MyClasses() {
  const { currentUser, getClasses, getAssignmentsForClass } = useApp()
  const childLinkProps = useChildLinkProps()
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const classes = getClasses()
  const searchPlaceholder = currentUser?.role === 'college' ? 'Search batches...' : 'Search classes...'

  const filtered = classes.filter(cls =>
    cls.displayName.toLowerCase().includes(search.toLowerCase())
  )
  const visibleClasses = isSearching ? (search ? filtered : []) : classes

  return (
    <div className="h-full flex flex-col bg-stone-50">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-3 pb-3 flex-shrink-0">
        <h1 className="text-[22px] font-semibold text-foreground">My Classes</h1>
      </div>

      {isSearching ? (
        <div className="px-4 pt-3 pb-3 flex items-center gap-2">
          <InputGroup className="flex-1 h-11 rounded-lg bg-card border-border shadow-none">
            <InputGroupInput
              id="search-batches"
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="text-sm min-w-0"
            />
            <InputGroupAddon>
              <MagnifyingGlass size={16} />
            </InputGroupAddon>
          </InputGroup>
          <button
            onClick={() => { setSearch(''); setIsSearching(false) }}
            className="text-[16px] text-primary font-medium px-1"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="px-4 pt-3 pb-3">
          <div
            className="flex items-center gap-2 bg-card border border-border rounded-lg h-11 px-3 cursor-pointer"
            onClick={() => setIsSearching(true)}
          >
            <MagnifyingGlass size={16} className="text-muted-foreground flex-shrink-0" />
            <span className="flex-1 text-sm text-muted-foreground truncate">{searchPlaceholder}</span>
          </div>
        </div>
      )}

      {/* Batch list */}
      <ul className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-4 list-none">
        {visibleClasses.map(cls => {
          const assignmentSummary = getAssignmentSummary(getAssignmentsForClass(cls.id))
          const attendanceRate = ATTENDANCE_BY_CLASS[cls.id] || 0

          return (
            <li key={cls.id}><Link
              {...childLinkProps(`/workspace/${cls.id}`)}
              className="block bg-card border border-border rounded-lg p-4 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-foreground truncate">{getCardTitle(cls.displayName)}</p>
                  <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
                    {cls.totalStudents} enrolled students
                  </p>
                </div>
                <CaretRight size={14} color="var(--color-muted-foreground)" className="mt-1 flex-shrink-0" />
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center text-[11px] px-3 py-1.5 rounded-full font-medium ${assignmentSummary.className}`}>
                  {assignmentSummary.label}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-medium bg-muted border border-border text-foreground">
                  <TrendUp size={12} weight="bold" className="text-emerald-600" />
                  {attendanceRate}% attendance
                </span>
              </div>
            </Link></li>
          )
        })}
      </ul>

      <BottomNav />
    </div>
  )
}
