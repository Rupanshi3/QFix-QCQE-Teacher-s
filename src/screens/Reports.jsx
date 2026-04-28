import { ArrowLeft } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Reports() {
  const navigate = useNavigate()
  const { currentUser, getClasses } = useApp()
  const classes = getClasses()

  const reportRows = classes.slice(0, 4).map((cls, index) => ({
    id: cls.id,
    title: cls.displayName || cls.subject,
    subtitle: cls.division || cls.yearLabel || 'Class report',
    generated: currentUser?.role === 'school' ? 24 + index * 3 : 42 + index * 6,
  }))

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
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[18px] font-semibold text-foreground">Reports</h1>
          <p className="text-[13px] text-muted-foreground">Generated student reports by class</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
        <div className="divide-y divide-border rounded-none bg-transparent">
          {reportRows.map((row) => {
            const filledCount = Math.max(1, Math.min(30, row.generated))
            return (
              <div key={row.id} className="py-4">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-foreground">{row.title}</p>
                </div>

                <div className="mt-4 grid grid-cols-10 gap-1.5">
                  {Array.from({ length: 30 }, (_, index) => (
                    <span
                      key={index}
                      className={`h-4 w-4 rounded-[4px] ${
                        index < filledCount ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                <p className="mt-3 text-[13px] text-muted-foreground">{row.generated} student reports generated</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
