import { CalendarBlank, Coffee } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { toMinutes } from '../lib/utils'
import ClassCard from '../components/ClassCard'
import BottomNav from '../components/BottomNav'
import { useChildNavigation } from '../lib/pageTransitions'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { schoolDaySchedule, collegeDaySchedule } from '../data/seed'

const HOUR_HEIGHT   = 80
const START_HOUR    = 8
const END_HOUR      = 18
const HOURS         = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const GRID_HEIGHT   = HOURS.length * HOUR_HEIGHT
const TIME_COL_W    = 56
const DAY_COL_W     = 155
const DATE_HEADER_H = 48

const formatHour = (h) => {
  if (h === 12) return '12 PM'
  if (h < 12)   return `${h} AM`
  return `${h - 12} PM`
}

// Resolves a day's schedule entries into fully-merged class objects with times.
// Lunch entries become { isLunch: true } objects.
function resolveDay(dayShort, masterClasses, daySchedule) {
  return (daySchedule[dayShort] || []).map(entry => {
    if (entry.type === 'lunch') {
      return {
        id: `lunch-${entry.startTime}`,
        isLunch: true,
        division: 'Lunch Break',
        displayName: 'Lunch Break',
        startTime: entry.startTime,
        endTime: entry.endTime,
      }
    }
    const cls = masterClasses.find(c => c.id === entry.classId)
    return cls ? { ...cls, startTime: entry.startTime, endTime: entry.endTime } : null
  }).filter(Boolean)
}

/* ── Lunch Block ─────────────────────────────────────────────────────────── */
function LunchBlock() {
  return (
    <div
      className="w-full h-full rounded-lg flex items-center gap-2 px-3"
      style={{ backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1' }}
    >
      <Coffee size={13} color="#94A3B8" weight="fill" />
      <span className="text-xs font-medium text-slate-400">Lunch Break</span>
    </div>
  )
}

/* ── Time Column ─────────────────────────────────────────────────────────── */
function TimeColumn({ sticky = false, nowTop, nowTimeLabel }) {
  return (
    <div
      className={`flex-shrink-0 relative bg-stone-50 z-20 ${sticky ? 'sticky left-0' : ''}`}
      style={{ width: TIME_COL_W, height: GRID_HEIGHT }}
    >
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ left: TIME_COL_W - 1, width: 1, backgroundColor: 'var(--border)' }}
      />
      {HOURS.map(hour => (
        <div
          key={hour}
          className="absolute left-0 pointer-events-none flex items-center justify-end"
          style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, width: TIME_COL_W - 4 }}
        >
          <span className="text-xs text-muted-foreground -mt-2 pr-2">
            {formatHour(hour)}
          </span>
        </div>
      ))}
      {nowTop != null && (
        <div
          className="absolute left-0 flex items-center justify-end pointer-events-none z-10"
          style={{ top: nowTop, width: TIME_COL_W - 4 }}
        >
          <Badge className="bg-primary text-white border-0 text-[10px] px-1.5 py-0 h-4 rounded-sm">
            {nowTimeLabel}
          </Badge>
        </div>
      )}
    </div>
  )
}

/* ── Date Header ─────────────────────────────────────────────────────────── */
function DateHeader({ isWeek, weekDays, today }) {
  return (
    <div
      className="sticky top-0 flex flex-shrink-0 bg-stone-50"
      style={{ height: DATE_HEADER_H, zIndex: 15 }}
    >
      <div
        className="flex-shrink-0 bg-stone-50"
        style={{
          width: TIME_COL_W,
          borderRight: '1px solid var(--border)',
          position: isWeek ? 'sticky' : undefined,
          left: isWeek ? 0 : undefined,
          zIndex: isWeek ? 30 : undefined,
        }}
      />

      {isWeek ? (
        <div className="flex flex-1" style={{ borderBottom: '1px solid var(--border)' }}>
          {weekDays.map(({ dayShort, isToday, d }, i) => (
            <div
              key={dayShort + d.getDate()}
              className="flex-shrink-0 flex flex-col items-center justify-center bg-stone-50 py-2"
              style={{ width: DAY_COL_W, borderLeft: i === 0 ? 'none' : '1px solid var(--border)' }}
            >
              <span className={`text-xs font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {dayShort}
              </span>
              {isToday ? (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-0.5">
                  <span className="text-[10px] font-bold text-white">{d.getDate()}</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground mt-0.5">{d.getDate()}</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex-1 flex items-center px-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-sm font-semibold text-foreground">
            {today.toLocaleDateString('en-US', { weekday: 'long' })}, {today.getDate()}
          </span>
        </div>
      )}
    </div>
  )
}

/* ── Day Column (week view) ──────────────────────────────────────────────── */
function DayColumn({ classes, onClassClick, isToday, isFirst = false }) {
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: DAY_COL_W, height: GRID_HEIGHT, borderLeft: isFirst ? 'none' : '1px solid var(--border)' }}
    >
      {HOURS.map(hour =>
        hour === START_HOUR ? null : (
          <div
            key={hour}
            className="absolute left-0 right-0 pointer-events-none"
            style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, borderTop: '1px solid var(--border)' }}
          />
        )
      )}


      {classes.map(cls => {
        if (!cls.startTime || !cls.endTime) return null
        const top    = (toMinutes(cls.startTime) - START_HOUR * 60) / 60 * HOUR_HEIGHT
        const height = Math.max((toMinutes(cls.endTime) - toMinutes(cls.startTime)) / 60 * HOUR_HEIGHT, 24)
        return (
          <div
            key={cls.id}
            className="absolute"
            style={{ top, height, left: 0, right: 0 }}
          >
            {cls.isLunch
              ? <LunchBlock />
              : <ClassCard cls={cls} onClick={() => onClassClick(cls.id)} compact />
            }
          </div>
        )
      })}
    </div>
  )
}

/* ── Home Screen ─────────────────────────────────────────────────────────── */
export default function Home() {
  const { currentUser, getClasses } = useApp()
  const pushChildPage = useChildNavigation()

  const masterClasses = getClasses()
  const schedule      = currentUser?.role === 'school' ? schoolDaySchedule : collegeDaySchedule

  const now           = new Date()
  const nowMinutes    = now.getHours() * 60 + now.getMinutes()
  const nowTimeLabel  = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const nowTopRaw     = (nowMinutes - START_HOUR * 60) / 60 * HOUR_HEIGHT
  const nowTop        = Math.max(0, Math.min(GRID_HEIGHT - 8, nowTopRaw))

  const todayDayShort = now.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
  const todayEntries  = resolveDay(todayDayShort, masterClasses, schedule)
  const todayClasses  = todayEntries.filter(c => !c.isLunch)

  const weekDays = Array.from({ length: 6 }, (_, i) => {
    const d        = new Date()
    d.setDate(d.getDate() + i)
    const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
    return { d, dayShort, dayClasses: resolveDay(dayShort, masterClasses, schedule), isToday: i === 0 }
  })

  return (
    <Tabs defaultValue="day" className="h-full flex flex-col gap-0 bg-stone-50">

      {/* ── App Header ── */}
      <div className="bg-card border-b border-border px-4 py-4 flex items-start justify-between flex-shrink-0">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">
            Hello {currentUser?.name?.split(' ')[0] || 'Teacher'},
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            You have {todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'} today
          </p>
        </div>
        <TabsList className="mt-1 flex-shrink-0">
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
        </TabsList>
      </div>

      {/* ── Day View ── */}
      <TabsContent value="day" className="flex-1 overflow-y-auto scrollbar-hide">
        <>
            <DateHeader isWeek={false} today={now} weekDays={[]} />

            <div className="relative flex" style={{ height: GRID_HEIGHT }}>
              <TimeColumn />

              <div className="relative flex-1">
                {HOURS.map(hour =>
                  hour === START_HOUR ? null : (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 pointer-events-none"
                      style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, borderTop: '1px solid var(--border)' }}
                    />
                  )
                )}

                {todayClasses.length === 0 ? (
                  <div className="absolute inset-x-4 top-24 bg-card border border-border rounded-2xl px-5 py-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-brand-tint flex items-center justify-center mx-auto">
                      <CalendarBlank size={24} weight="fill" className="text-primary" />
                    </div>
                    <p className="text-[16px] font-semibold text-foreground mt-3">You have no classes today</p>
                    <p className="text-[13px] text-muted-foreground mt-1">Switch to Week view to plan your upcoming classes.</p>
                  </div>
                ) : (
                  todayEntries.map(cls => {
                    if (!cls.startTime || !cls.endTime) return null
                    const top    = (toMinutes(cls.startTime) - START_HOUR * 60) / 60 * HOUR_HEIGHT
                    const height = Math.max((toMinutes(cls.endTime) - toMinutes(cls.startTime)) / 60 * HOUR_HEIGHT, 24)
                    return (
                      <div
                        key={cls.id}
                        className="absolute"
                        style={{ top, height, left: 0, right: 0 }}
                      >
                        {cls.isLunch
                          ? <LunchBlock />
                          : <ClassCard cls={cls} onClick={() => pushChildPage(`/workspace/${cls.id}`)} />
                        }
                      </div>
                    )
                  })
                )}
              </div>

              {/* Now indicator */}
              <div
                className="absolute left-0 right-0 flex items-center z-20 pointer-events-none"
                style={{ top: nowTop }}
              >
                <div className="flex items-center justify-end pr-1" style={{ width: TIME_COL_W - 4 }}>
                  <Badge className="bg-primary text-white border-0 text-[10px] px-1.5 py-0 h-4 rounded-sm">
                    {nowTimeLabel}
                  </Badge>
                </div>
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <div className="flex-1 h-px bg-primary" />
              </div>
            </div>

            {/* Spacer so last row scrolls above the absolute BottomNav */}
            <div style={{ height: 72 }} />
          </>
      </TabsContent>

      {/* ── Week View ── */}
      <TabsContent value="week" className="flex-1 overflow-hidden">
        <div
          className="h-full overflow-x-auto overflow-y-auto scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div style={{ width: TIME_COL_W + weekDays.length * DAY_COL_W }}>
            <DateHeader isWeek weekDays={weekDays} today={now} />

            <div className="relative flex" style={{ height: GRID_HEIGHT }}>
              <TimeColumn sticky nowTop={nowTop} nowTimeLabel={nowTimeLabel} />
              {weekDays.map(({ d, dayShort, dayClasses, isToday }, index) => (
                <DayColumn
                  key={dayShort + d.getDate()}
                  classes={dayClasses}
                  onClassClick={(id) => pushChildPage(`/workspace/${id}`)}
                  isToday={isToday}
                  isFirst={index === 0}
                />
              ))}

              {/* Now indicator — dot + line spanning all day columns */}
              <div
                className="absolute right-0 flex items-center z-10 pointer-events-none"
                style={{ top: nowTop, left: TIME_COL_W - 4 }}
              >
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <div className="flex-1 h-px bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <BottomNav />
    </Tabs>
  )
}
