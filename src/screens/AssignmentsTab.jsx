import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Warning } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { formatDueDate } from '../lib/utils'
import BottomNav from '../components/BottomNav'
import BottomSheet from '../components/BottomSheet'
import AssignmentForm from '../components/AssignmentForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AssignmentsTab() {
  const { getClasses, getAssignmentsForClass, addAssignment } = useApp()
  const [filter, setFilter] = useState('All')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showClosed, setShowClosed] = useState(false)

  const classes = getClasses()
  const allAssignments = classes.flatMap(cls =>
    getAssignmentsForClass(cls.id).map(a => ({ ...a, className: cls.displayName }))
  )

  const active = allAssignments.filter(a => !a.overdue && a.status !== 'closed')
  const overdue = allAssignments.filter(a => a.overdue && a.status !== 'closed')
  const closed = allAssignments.filter(a => a.status === 'closed')

  const displayActive = [...active, ...overdue].sort((a, b) => {
    if (a.overdue && !b.overdue) return 1
    if (!a.overdue && b.overdue) return -1
    return 0
  })

  const filtered = filter === 'All' ? displayActive
    : filter === 'Active' ? active
    : closed

  const handlePost = ({ title, dueDate }) => {
    const firstClass = classes[0]
    if (firstClass) addAssignment(firstClass.id, { title, dueDate, status: 'active' })
    setSheetOpen(false)
  }

  const StatusBadge = ({ overdue: isOverdue, status }) => {
    if (isOverdue) return <Badge className="text-[11px] font-semibold flex-shrink-0 bg-error-muted text-error border-none">Overdue</Badge>
    if (status === 'closed') return <Badge className="text-[11px] font-semibold flex-shrink-0 bg-muted text-muted-foreground border-none">Closed</Badge>
    return <Badge className="text-[11px] font-semibold flex-shrink-0 bg-success-muted text-success border-none">Active</Badge>
  }

  const dueLine = formatDueDate

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="bg-card border-b border-border px-4 pt-3 pb-3 flex-shrink-0">
        <h1 className="text-[22px] font-semibold text-foreground">Assignments</h1>
      </div>

      {/* Filter pills */}
      <div className="px-4 py-3 flex gap-2">
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
      </div>

      <ul className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-4 list-none">
        {filtered.length === 0 ? (
          <li className="py-16 text-center">
            <p className="text-[15px] text-muted-foreground">No assignments in this category</p>
          </li>
        ) : (
          filtered.map(asgn => (
            <li key={asgn.id}><Link
              to={`/assignment/${asgn.id}?classId=${asgn.classId}`}
              className="block bg-card border border-border rounded-lg p-4 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {asgn.overdue && <Warning size={13} weight="fill" color="var(--color-warning)" className="flex-shrink-0" />}
                    <p className="text-[15px] font-semibold text-foreground truncate">{asgn.title}</p>
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-0.5 truncate">{asgn.className}</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{dueLine(asgn.dueDate)}</p>
                </div>
                <StatusBadge overdue={asgn.overdue} status={asgn.status} />
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
              <span className="text-[13px] text-muted-foreground">{showClosed ? '▲' : '▼'}</span>
            </button>
            {showClosed && closed.map(asgn => (
              <Link
                key={asgn.id}
                to={`/assignment/${asgn.id}?classId=${asgn.classId}`}
                className="block bg-card border border-border rounded-lg p-4 active:scale-[0.98] transition-transform mb-4 opacity-70"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-muted-foreground truncate">{asgn.title}</p>
                    <p className="text-[13px] text-muted-foreground truncate mt-0.5">{asgn.className}</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{dueLine(asgn.dueDate)}</p>
                  </div>
                  <Badge className="text-[11px] font-semibold flex-shrink-0 bg-muted text-muted-foreground border-none">Closed</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </ul>

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        className="absolute bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform z-30 bg-primary"
        aria-label="New assignment"
      >
        <Plus size={24} weight="bold" color="white" />
      </button>

      <BottomNav />

      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="New Assignment">
        <AssignmentForm onSubmit={handlePost} />
      </BottomSheet>
    </div>
  )
}
