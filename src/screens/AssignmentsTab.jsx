import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CaretDown, Plus, Warning } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { formatDueDate } from '../lib/utils'
import { useChildLinkProps } from '../lib/pageTransitions'
import BottomNav from '../components/BottomNav'
import BottomSheet from '../components/BottomSheet'
import AssignmentForm from '../components/AssignmentForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AssignmentsTab() {
  const { getClasses, getAssignmentsForClass, addAssignment } = useApp()
  const childLinkProps = useChildLinkProps()
  const [filter, setFilter] = useState('All')
  const [classFilter, setClassFilter] = useState('All classes')
  const [assignmentClassId, setAssignmentClassId] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [classSheetOpen, setClassSheetOpen] = useState(false)
  const [showClosed, setShowClosed] = useState(false)

  const classes = getClasses()
  const allAssignments = classes.flatMap(cls =>
    getAssignmentsForClass(cls.id).map(a => ({ ...a, className: cls.displayName }))
  )
  const classFilteredAssignments = classFilter === 'All classes'
    ? allAssignments
    : allAssignments.filter(a => a.classId === classFilter)

  const active = classFilteredAssignments.filter(a => !a.overdue && a.status !== 'closed')
  const overdue = classFilteredAssignments.filter(a => a.overdue && a.status !== 'closed')
  const closed = classFilteredAssignments.filter(a => a.status === 'closed')

  const displayActive = [...active, ...overdue].sort((a, b) => {
    if (a.overdue && !b.overdue) return 1
    if (!a.overdue && b.overdue) return -1
    return 0
  })

  const filtered = filter === 'All' ? displayActive
    : filter === 'Active' ? active
    : closed

  const handlePost = ({ title, description, dueDate, attachmentName, reminderTime, reminderRepeatDays }) => {
    const targetClass = classes.find(cls => cls.id === assignmentClassId) || classes[0]
    if (targetClass) {
      addAssignment(targetClass.id, {
        title,
        description,
        dueDate,
        attachmentName,
        reminderTime,
        reminderRepeatDays,
        status: 'active',
      })
    }
    setSheetOpen(false)
  }

  const DueBadge = ({ assignment }) => {
    const className = assignment.overdue
      ? 'bg-error-muted text-error border-none'
      : assignment.status === 'closed'
      ? 'bg-muted text-muted-foreground border-none'
      : 'bg-brand-tint text-primary border-none'

    return (
      <Badge className={`text-[11px] font-semibold flex-shrink-0 ${className}`}>
        {dueLine(assignment.dueDate)}
      </Badge>
    )
  }

  const dueLine = formatDueDate
  const classFilterLabel = classFilter === 'All classes'
    ? 'All classes'
    : classes.find(cls => cls.id === classFilter)?.displayName || 'All classes'

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="bg-card border-b border-border px-4 pt-3 pb-3 flex-shrink-0">
        <h1 className="text-[22px] font-semibold text-foreground">Assignments</h1>
      </div>

      {/* Filter pills */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {['All', 'Active', 'Closed'].map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className={`rounded-full text-[13px] px-4 ${filter !== f ? 'border-border text-foreground' : ''}`}
            >
              {f}
            </Button>
          ))}
          <div className="h-8 w-px bg-border flex-shrink-0 mx-2" />
          <button
            onClick={() => setClassSheetOpen(true)}
            className="h-8 rounded-full border border-border bg-card px-3 text-[13px] font-medium text-foreground flex items-center gap-1.5 flex-shrink-0"
          >
            <span className="max-w-[150px] truncate">{classFilterLabel}</span>
            <CaretDown size={14} className="text-muted-foreground flex-shrink-0" />
          </button>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-4 list-none">
        {filtered.length === 0 ? (
          <li className="py-16 text-center">
            <p className="text-[15px] text-muted-foreground">No assignments in this category</p>
          </li>
        ) : (
          filtered.map(asgn => (
            <li key={asgn.id}><Link
              {...childLinkProps(`/assignment/${asgn.id}?classId=${asgn.classId}`)}
              className="block bg-card border border-border rounded-lg p-4 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {asgn.overdue && <Warning size={13} weight="fill" color="var(--color-warning)" className="flex-shrink-0" />}
                    <p className="text-[15px] font-semibold text-foreground truncate">{asgn.title}</p>
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-0.5 truncate">{asgn.className}</p>
                </div>
                <DueBadge assignment={asgn} />
              </div>
            </Link></li>
          ))
        )}

        {/* Closed section */}
        {filter === 'All' && closed.length > 0 && (
          <div>
            <button
              onClick={() => setShowClosed(v => !v)}
              className="w-full text-left px-1 py-2 flex items-center justify-between"
            >
              <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">Closed ({closed.length})</span>
              <CaretDown
                size={14}
                weight="bold"
                className={`text-muted-foreground transition-transform ${showClosed ? 'rotate-180' : ''}`}
              />
            </button>
            {showClosed && closed.map(asgn => (
              <Link
                key={asgn.id}
                {...childLinkProps(`/assignment/${asgn.id}?classId=${asgn.classId}`)}
                className="block bg-card border border-border rounded-lg p-4 active:scale-[0.98] transition-transform mb-4 opacity-70"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-muted-foreground truncate">{asgn.title}</p>
                    <p className="text-[13px] text-muted-foreground truncate mt-0.5">{asgn.className}</p>
                  </div>
                  <DueBadge assignment={asgn} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </ul>

      {/* FAB */}
      <button
        onClick={() => {
          setAssignmentClassId(classFilter === 'All classes' ? classes[0]?.id || '' : classFilter)
          setSheetOpen(true)
        }}
        className="absolute bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform z-30 bg-primary"
        aria-label="New assignment"
      >
        <Plus size={24} weight="bold" color="white" />
      </button>

      <BottomNav />

      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="New Assignment">
        <div className="px-4 pt-4">
          <label className="text-[13px] font-medium text-foreground mb-1.5 block">
            Assignment for <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <select
              value={assignmentClassId}
              onChange={event => setAssignmentClassId(event.target.value)}
              className="h-12 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-10 text-[15px] font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.displayName}
                </option>
              ))}
            </select>
            <CaretDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <AssignmentForm onSubmit={handlePost} showDescription showAttach />
      </BottomSheet>

      <BottomSheet isOpen={classSheetOpen} onClose={() => setClassSheetOpen(false)} title="Filter by class">
        <div className="px-4 pt-4 flex flex-col gap-2">
          {['All classes', ...classes.map(cls => cls.id)].map(option => {
            const label = option === 'All classes'
              ? 'All classes'
              : classes.find(cls => cls.id === option)?.displayName || option
            const selected = classFilter === option

            return (
              <button
                key={option}
                onClick={() => {
                  setClassFilter(option)
                  setClassSheetOpen(false)
                }}
                className={`min-h-12 rounded-xl border px-4 py-3 text-left transition-colors ${
                  selected
                    ? 'border-primary bg-brand-tint text-primary'
                    : 'border-border bg-card text-foreground active:bg-muted'
                }`}
              >
                <span className="text-[15px] font-semibold">{label}</span>
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </div>
  )
}
