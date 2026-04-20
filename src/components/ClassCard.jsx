import { CaretRight } from '@phosphor-icons/react'
import { toMinutes } from '../lib/utils'

const CLASS_ROOMS = {
  'cb-cse1-pf': 'Room A-203',
  'cb-cse2-ds': 'Room B-114',
  'cb-cse2-algo': 'Room B-208',
  'cb-cse3-db': 'Room C-301',
  'cb-cse3-cn': 'Room C-214',
  'cb-cse3-os': 'Room C-118',
  'sc-6a': 'Room 6A',
  'sc-7a': 'Room 7A',
  'sc-7b': 'Room 7B',
  'sc-8c': 'Room 8C',
  'sc-9a': 'Room 9A',
}

export default function ClassCard({ cls, onClick, compact = false }) {
  const accentColor = cls.color || 'var(--teacher-brand-800)'
  const room = CLASS_ROOMS[cls.id]

  const duration = cls.startTime && cls.endTime
    ? toMinutes(cls.endTime) - toMinutes(cls.startTime)
    : null

  return (
    <button
      onClick={onClick}
      className="w-full h-full bg-card rounded-lg flex items-stretch overflow-hidden active:scale-[0.98] transition-transform text-left"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
    >
      <div className="w-0.5 flex-shrink-0" style={{ backgroundColor: accentColor }} />
      <div className={`flex-1 flex justify-between gap-3 min-w-0 ${compact ? 'items-start p-2' : 'items-center px-4 py-3'}`}>
        <div className="flex-1 min-w-0">
          <p className={`${compact ? 'text-[12px]' : 'text-sm'} font-semibold text-foreground truncate`}>{cls.division}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {cls.subject}{duration ? ` · ${duration} mins` : ''}
            {room ? <> · <span className="font-semibold text-foreground">{room}</span></> : null}
          </p>
        </div>
        <CaretRight size={14} color="var(--color-muted-foreground)" className="flex-shrink-0" />
      </div>
    </button>
  )
}
