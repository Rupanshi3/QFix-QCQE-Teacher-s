import { Warning } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'

export default function AssignmentCard({ assignment, onClick }) {
  const { title, dueDate, submitted, total, overdue } = assignment
  const dueLine = overdue
    ? 'Due date passed'
    : dueDate === 'TBD'
    ? 'No due date'
    : `Due ${dueDate}`

  return (
    <button
      onClick={onClick}
      className={`w-full bg-card border border-border rounded-lg p-4 text-left active:scale-[0.98] transition-transform ${
        overdue ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {overdue && <Warning size={14} weight="fill" color="var(--color-warning)" className="flex-shrink-0 mt-0.5" />}
            <p className={`text-[15px] font-semibold truncate ${overdue ? 'text-muted-foreground' : 'text-foreground'}`}>
              {title}
            </p>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1">{dueLine}</p>
        </div>
        <Badge className="text-[11px] font-semibold flex-shrink-0 bg-brand-tint text-primary border-none">
          {submitted}/{total} submitted
        </Badge>
      </div>
    </button>
  )
}
