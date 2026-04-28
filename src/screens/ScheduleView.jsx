import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarBlank, CaretDown, Coffee, Plus, CalendarPlus, Rows } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { toMinutes } from '../lib/utils'
import ClassCard from '../components/ClassCard'
import BottomNav from '../components/BottomNav'
import BottomSheet from '../components/BottomSheet'
import { useChildNavigation } from '../lib/pageTransitions'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { schoolDaySchedule, collegeDaySchedule } from '../data/seed'

const HOUR_HEIGHT = 80
const START_HOUR = 8
const END_HOUR = 18
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const GRID_HEIGHT = HOURS.length * HOUR_HEIGHT
const TIME_COL_W = 56
const DAY_COL_W = 155
const DATE_HEADER_H = 48
const EVENT_ACCENT = '#E8F0FF'
const EVENT_BORDER = '#B7C8F5'

const DEFAULT_EVENTS = {
  school: [
    {
      id: 'school-event-1',
      title: 'Math practice hour',
      note: 'Chapter revision with problem-solving',
      dayShort: 'Tue',
      startTime: '15:00',
      endTime: '16:00',
    },
    {
      id: 'school-event-2',
      title: 'Science fair briefing',
      note: 'Class teachers align on student responsibilities',
      dayShort: 'Thu',
      startTime: '13:00',
      endTime: '13:45',
    },
  ],
  college: [
    {
      id: 'college-event-1',
      title: 'Coding practice slot',
      note: 'Open lab preparation for internal assessment',
      dayShort: 'Tue',
      startTime: '15:00',
      endTime: '16:00',
    },
    {
      id: 'college-event-2',
      title: 'Placement prep session',
      note: 'Faculty-led mock interview briefing',
      dayShort: 'Thu',
      startTime: '13:00',
      endTime: '14:00',
    },
  ],
}

const formatHour = (h) => {
  if (h === 12) return '12 PM'
  if (h < 12) return `${h} AM`
  return `${h - 12} PM`
}

function resolveDay(dayShort, masterClasses, daySchedule, events = []) {
  const scheduleItems = (daySchedule[dayShort] || []).map(entry => {
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

  const eventItems = events
    .filter(event => event.dayShort === dayShort)
    .map(event => ({
      ...event,
      isEvent: true,
      displayName: event.title,
    }))

  return [...scheduleItems, ...eventItems].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
}

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

function EventBlock({ event }) {
  return (
    <div
      className="flex h-full w-full flex-col justify-between rounded-lg px-3 py-2"
      style={{ backgroundColor: EVENT_ACCENT, border: `1px solid ${EVENT_BORDER}` }}
    >
      <div>
        <p className="text-[12px] font-semibold text-primary">{event.title}</p>
        {event.note && (
          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-primary/80">{event.note}</p>
        )}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary/70">Event</p>
    </div>
  )
}

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
        <div className="flex-1 flex items-center px-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-semibold text-foreground">
            {today.toLocaleDateString('en-US', { weekday: 'long' })}, {today.getDate()}
          </span>
        </div>
      )}
    </div>
  )
}

function DayColumn({ classes, onClassClick, isFirst = false }) {
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
        const top = (toMinutes(cls.startTime) - START_HOUR * 60) / 60 * HOUR_HEIGHT
        const height = Math.max((toMinutes(cls.endTime) - toMinutes(cls.startTime)) / 60 * HOUR_HEIGHT, 24)
        return (
          <div key={cls.id} className="absolute" style={{ top, height, left: 0, right: 0 }}>
            {cls.isLunch
              ? <LunchBlock />
              : cls.isEvent
              ? <EventBlock event={cls} />
              : <ClassCard cls={cls} onClick={() => onClassClick(cls.id)} compact />
            }
          </div>
        )
      })}
    </div>
  )
}

export default function ScheduleView() {
  const navigate = useNavigate()
  const { currentUser, getClasses } = useApp()
  const pushChildPage = useChildNavigation()
  const [actionsOpen, setActionsOpen] = useState(false)
  const [eventSheetOpen, setEventSheetOpen] = useState(false)
  const [customEvents, setCustomEvents] = useState([])
  const [selectedEventClassId, setSelectedEventClassId] = useState('')
  const [eventTitle, setEventTitle] = useState('')
  const [eventDay, setEventDay] = useState('Tue')
  const [eventStartTime, setEventStartTime] = useState('15:00')
  const [eventEndTime, setEventEndTime] = useState('16:00')
  const [eventNote, setEventNote] = useState('')

  const masterClasses = getClasses()
  const schedule = currentUser?.role === 'school' ? schoolDaySchedule : collegeDaySchedule
  const calendarEvents = useMemo(
    () => [...DEFAULT_EVENTS[currentUser?.role === 'school' ? 'school' : 'college'], ...customEvents],
    [currentUser?.role, customEvents]
  )

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const nowTimeLabel = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const nowTopRaw = (nowMinutes - START_HOUR * 60) / 60 * HOUR_HEIGHT
  const nowTop = Math.max(0, Math.min(GRID_HEIGHT - 8, nowTopRaw))

  const todayDayShort = now.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
  const todayEntries = resolveDay(todayDayShort, masterClasses, schedule, calendarEvents)
  const todayClasses = todayEntries.filter(c => !c.isLunch)

  const weekDays = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
    return { d, dayShort, dayClasses: resolveDay(dayShort, masterClasses, schedule, calendarEvents), isToday: i === 0 }
  })

  const handleCreateEvent = () => {
    if (!selectedEventClassId || !eventTitle.trim() || !eventStartTime || !eventEndTime) return
    const selectedClass = masterClasses.find((item) => item.id === selectedEventClassId)
    setCustomEvents(prev => [
      ...prev,
      {
        id: `event-${Date.now()}`,
        title: eventTitle.trim(),
        note: eventNote.trim(),
        classId: selectedEventClassId,
        classLabel: selectedClass?.displayName || selectedClass?.subject || '',
        dayShort: eventDay,
        startTime: eventStartTime,
        endTime: eventEndTime,
      },
    ])
    setSelectedEventClassId('')
    setEventTitle('')
    setEventDay('Tue')
    setEventStartTime('15:00')
    setEventEndTime('16:00')
    setEventNote('')
    setEventSheetOpen(false)
  }

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <Tabs defaultValue="day" className="h-full flex flex-1 flex-col gap-0 bg-stone-50 pb-24">
        <div className="bg-card border-b border-border px-4 pt-3 pb-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} color="var(--color-foreground)" weight="bold" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-semibold text-foreground truncate">All classes</h1>
            <p className="text-[13px] text-muted-foreground">Day and week calendar view</p>
          </div>
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </div>

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
                    const top = (toMinutes(cls.startTime) - START_HOUR * 60) / 60 * HOUR_HEIGHT
                    const height = Math.max((toMinutes(cls.endTime) - toMinutes(cls.startTime)) / 60 * HOUR_HEIGHT, 24)
                    return (
                      <div key={cls.id} className="absolute" style={{ top, height, left: 0, right: 0 }}>
                        {cls.isLunch
                          ? <LunchBlock />
                          : cls.isEvent
                          ? <EventBlock event={cls} />
                          : <ClassCard cls={cls} onClick={() => pushChildPage(`/workspace/${cls.id}`)} />
                        }
                      </div>
                    )
                  })
                )}
              </div>

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

            <div style={{ height: 72 }} />
          </>
        </TabsContent>

        <TabsContent value="week" className="flex-1 overflow-hidden">
          <div
            className="h-full overflow-x-auto overflow-y-auto scrollbar-hide"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div style={{ width: TIME_COL_W + weekDays.length * DAY_COL_W }}>
              <DateHeader isWeek weekDays={weekDays} today={now} />

              <div className="relative flex" style={{ height: GRID_HEIGHT }}>
                <TimeColumn sticky nowTop={nowTop} nowTimeLabel={nowTimeLabel} />
                {weekDays.map(({ d, dayShort, dayClasses }, index) => (
                  <DayColumn
                    key={dayShort + d.getDate()}
                    classes={dayClasses}
                    onClassClick={(id) => pushChildPage(`/workspace/${id}`)}
                    isFirst={index === 0}
                  />
                ))}

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
      </Tabs>

      <button
        type="button"
        onClick={() => setActionsOpen(true)}
        className="absolute bottom-28 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white active:scale-95"
        aria-label="Create event or timetable"
      >
        <Plus size={24} weight="bold" />
      </button>

      <BottomNav />

      <BottomSheet isOpen={actionsOpen} onClose={() => setActionsOpen(false)} title="Create">
        <div className="px-4 py-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setActionsOpen(false)
              setEventSheetOpen(true)
            }}
            className="rounded-xl border border-border bg-card px-4 py-4 text-left active:bg-muted"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-tint text-primary">
                <CalendarPlus size={18} weight="fill" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Create event</p>
                <p className="mt-1 text-[13px] text-muted-foreground">Add practice sessions, briefings, or special calendar slots.</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActionsOpen(false)
              pushChildPage('/schedule/timetable')
            }}
            className="rounded-xl border border-border bg-card px-4 py-4 text-left active:bg-muted"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-tint text-primary">
                <Rows size={18} weight="fill" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Create class timetable</p>
                <p className="mt-1 text-[13px] text-muted-foreground">Set up a timetable for a class on a dedicated page.</p>
              </div>
            </div>
          </button>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={eventSheetOpen} onClose={() => setEventSheetOpen(false)} title="New Event">
        <div className="px-4 py-4 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-foreground">Class</label>
            <div className="relative">
              <select
                value={selectedEventClassId}
                onChange={(e) => setSelectedEventClassId(e.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-border bg-card px-3 pr-10 text-[14px] text-foreground outline-none"
              >
                <option value="">Select class</option>
                {masterClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.displayName || cls.subject}
                  </option>
                ))}
              </select>
              <CaretDown
                size={16}
                weight="bold"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-foreground">Event title</label>
            <input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Practice session"
              className="h-11 w-full rounded-lg border border-border bg-card px-3 text-[14px] text-foreground outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-foreground">Day</label>
            <div className="grid grid-cols-3 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setEventDay(day)}
                  className={`h-10 rounded-lg border text-[13px] font-medium ${
                    eventDay === day
                      ? 'border-primary bg-brand-tint text-primary'
                      : 'border-border bg-card text-foreground'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-foreground">Start time</label>
              <input
                type="time"
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-card px-3 text-[14px] text-foreground outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-foreground">End time</label>
              <input
                type="time"
                value={eventEndTime}
                onChange={(e) => setEventEndTime(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-card px-3 text-[14px] text-foreground outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-foreground">Note</label>
            <textarea
              value={eventNote}
              onChange={(e) => setEventNote(e.target.value)}
              placeholder="Add any context for this event"
              className="min-h-24 w-full rounded-lg border border-border bg-card px-3 py-3 text-[14px] text-foreground outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleCreateEvent}
            disabled={!selectedEventClassId || !eventTitle.trim() || !eventStartTime || !eventEndTime}
            className="h-11 rounded-lg bg-primary text-[14px] font-semibold text-white disabled:opacity-50"
          >
            Add event to calendar
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
