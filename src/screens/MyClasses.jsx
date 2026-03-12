import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass, Books, CaretRight } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function MyClasses() {
  const { getClasses } = useApp()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All Batches')
  const classes = getClasses()

  const filtered = classes.filter(cls =>
    cls.displayName.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'All Batches' || cls.division === filter)
  )

  return (
    <div className="h-full flex flex-col bg-stone-50">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-3 pb-3 flex-shrink-0">
        <h1 className="text-[22px] font-semibold text-foreground">My Classes</h1>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2.5">
          <MagnifyingGlass size={16} color="var(--color-muted-foreground)" />
          <label htmlFor="search-batches" className="sr-only">Search batches</label>
          <Input
            id="search-batches"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search batches…"
            className="flex-1 text-[15px] border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {['All Batches', 'CSE First Year', 'CSE Second Year', 'CSE Third Year'].map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 rounded-full text-[13px] px-3 ${filter !== f ? 'border-border text-foreground' : ''}`}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Batch list */}
      <ul className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-4 list-none">
        {filtered.map(cls => (
          <li key={cls.id}><Link
            to={`/workspace/${cls.id}`}
            className="block bg-card border border-border rounded-lg p-4 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-tint flex items-center justify-center flex-shrink-0">
                <Books size={20} weight="fill" color="var(--color-primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground truncate">{cls.displayName}</p>
                <p className="text-[13px] text-muted-foreground">{cls.time}</p>
              </div>
              <CaretRight size={14} color="var(--color-muted-foreground)" />
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-muted-foreground bg-muted border border-border px-2 py-1 rounded-lg">
                👥 {cls.totalStudents} students
              </span>
              <span className="text-[11px] text-muted-foreground bg-muted border border-border px-2 py-1 rounded-lg">
                📅 Last: {cls.lastAttendance}
              </span>
              <span className={`text-[11px] px-2 py-1 rounded-lg font-medium ${
                cls.activeAssignments > 0
                  ? 'text-primary bg-brand-tint'
                  : 'text-muted-foreground bg-muted border border-border'
              }`}>
                📝 {cls.activeAssignments} assignment{cls.activeAssignments !== 1 ? 's' : ''}
              </span>
            </div>
          </Link></li>
        ))}
      </ul>

      <BottomNav />
    </div>
  )
}
