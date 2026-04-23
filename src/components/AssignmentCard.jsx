import { Warning } from '@phosphor-icons/react'

export default function AssignmentCard({ assignment, onClick }) {
  const { title, dueDate, submitted, total, overdue } = assignment
  const graded = Math.min(submitted, Math.max(0, Math.round(submitted * 0.6)))
  const dueLine = overdue
    ? 'Due date passed'
    : dueDate === 'TBD'
    ? 'No due date'
    : `Due ${dueDate}`

  return (
    <button
      onClick={onClick}
      className={`w-full py-3 text-left active:bg-muted/30 transition-colors ${
        overdue ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {overdue && <Warning size={14} weight="fill" color="var(--color-warning)" className="flex-shrink-0 mt-0.5" />}
            <p className={`text-[15px] font-semibold truncate ${overdue ? 'text-muted-foreground' : 'text-foreground'}`}>
              {title}
            </p>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
            {submitted}/{total} submitted · {graded}/{submitted} graded
          </p>
        </div>
        <p className="text-[12px] font-semibold text-muted-foreground flex-shrink-0 pt-0.5">
          {dueLine}
        </p>
      </div>
    </button>
  )
}
