import { useMemo, useState } from 'react'
import {
  Bell,
  BellRinging,
  CalendarBlank,
  CaretRight,
  ChatCircleDots,
  Coffee,
  FileText,
  CalendarDots,
} from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'
import BottomSheet from '../components/BottomSheet'
import { useChildNavigation } from '../lib/pageTransitions'
import { toMinutes } from '../lib/utils'
import ClassCard from '../components/ClassCard'
import { schoolDaySchedule, collegeDaySchedule } from '../data/seed'

const WEEKDAY_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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
const HOUR_HEIGHT = 72
const START_HOUR = 8
const END_HOUR = 18
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const GRID_HEIGHT = HOURS.length * HOUR_HEIGHT
const TIME_COL_W = 52
const DAY_COL_W = 150
const DATE_HEADER_H = 44

function formatClassTime(time) {
  if (!time) return ''
  const [hourString, minute] = time.split(':')
  const hour = Number(hourString)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalizedHour = hour % 12 || 12
  return `${normalizedHour}:${minute} ${suffix}`
}

function formatHour(hour) {
  if (hour === 12) return '12 PM'
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

function getDayLabel(offset, day) {
  if (offset === 0) return 'Today'
  if (offset === 1) return 'Tomorrow'
  return day
}

function getUpcomingClasses(classes, schedule) {
  const todayIndex = new Date().getDay()
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return Object.entries(schedule)
    .flatMap(([day, entries]) =>
      entries
        .filter(entry => entry.classId)
        .map(entry => {
          const cls = classes.find(item => item.id === entry.classId)
          if (!cls) return null

          const dayIndex = WEEKDAY_ORDER.indexOf(day)
          let offset = dayIndex - todayIndex
          if (offset < 0) offset += 7

          const [hourString, minuteString] = entry.startTime.split(':')
          const startMinutes = Number(hourString) * 60 + Number(minuteString)
          if (offset === 0 && startMinutes < nowMinutes) offset += 7

          return {
            ...cls,
            day,
            offset,
            startTime: entry.startTime,
            endTime: entry.endTime,
          }
        })
        .filter(Boolean)
    )
    .sort((a, b) => {
      if (a.offset !== b.offset) return a.offset - b.offset
      return a.startTime.localeCompare(b.startTime)
    })
}

function resolveDay(dayShort, masterClasses, daySchedule) {
  return (daySchedule[dayShort] || [])
    .map(entry => {
      if (entry.type === 'lunch') {
        return {
          id: `lunch-${dayShort}-${entry.startTime}`,
          isLunch: true,
          division: 'Lunch Break',
          displayName: 'Lunch Break',
          startTime: entry.startTime,
          endTime: entry.endTime,
        }
      }
      const cls = masterClasses.find(c => c.id === entry.classId)
      return cls ? { ...cls, startTime: entry.startTime, endTime: entry.endTime } : null
    })
    .filter(Boolean)
}

function LunchBlock() {
  return (
    <div className="flex h-full w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3">
      <Coffee size={13} color="#94A3B8" weight="fill" />
      <span className="text-xs font-medium text-slate-400">Lunch Break</span>
    </div>
  )
}

function DateHeader({ isWeek, weekDays, today }) {
  return (
    <div className="sticky top-0 z-10 flex bg-stone-50" style={{ height: DATE_HEADER_H }}>
      <div
        className="shrink-0 bg-stone-50"
        style={{ width: TIME_COL_W, borderRight: '1px solid var(--border)' }}
      />

      {isWeek ? (
        <div className="flex flex-1 border-b border-border">
          {weekDays.map(({ dayShort, isToday, d }, index) => (
            <div
              key={`${dayShort}-${d.getDate()}`}
              className="flex shrink-0 flex-col items-center justify-center bg-stone-50 py-2"
              style={{ width: DAY_COL_W, borderLeft: index === 0 ? 'none' : '1px solid var(--border)' }}
            >
              <span className={`text-xs font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {dayShort}
              </span>
              {isToday ? (
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <span className="text-[10px] font-bold text-white">{d.getDate()}</span>
                </div>
              ) : (
                <span className="mt-0.5 text-xs text-muted-foreground">{d.getDate()}</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center px-3 border-b border-border">
          <span className="text-sm font-semibold text-foreground">
            {today.toLocaleDateString('en-US', { weekday: 'long' })}, {today.getDate()}
          </span>
        </div>
      )}
    </div>
  )
}

function TimeColumn({ sticky = false, nowTop, nowTimeLabel }) {
  return (
    <div
      className={`relative shrink-0 bg-stone-50 z-10 ${sticky ? 'sticky left-0' : ''}`}
      style={{ width: TIME_COL_W, height: GRID_HEIGHT }}
    >
      <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: TIME_COL_W - 1, width: 1, backgroundColor: 'var(--border)' }} />
      {HOURS.map(hour => (
        <div
          key={hour}
          className="pointer-events-none absolute left-0 flex items-center justify-end"
          style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, width: TIME_COL_W - 4 }}
        >
          <span className="-mt-2 pr-2 text-[11px] text-muted-foreground">{formatHour(hour)}</span>
        </div>
      ))}
      {nowTop != null && nowTimeLabel && (
        <div
          className="pointer-events-none absolute left-0 z-10 flex items-center justify-end"
          style={{ top: nowTop, width: TIME_COL_W - 4 }}
        >
          <Badge className="h-4 rounded-sm border-0 bg-primary px-1.5 py-0 text-[10px] text-white">
            {nowTimeLabel}
          </Badge>
        </div>
      )}
    </div>
  )
}

function DayColumn({ classes, onClassClick, isFirst = false }) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: DAY_COL_W, height: GRID_HEIGHT, borderLeft: isFirst ? 'none' : '1px solid var(--border)' }}
    >
      {HOURS.map(hour =>
        hour === START_HOUR ? null : (
          <div
            key={hour}
            className="pointer-events-none absolute left-0 right-0"
            style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, borderTop: '1px solid var(--border)' }}
          />
        )
      )}

      {classes.map(cls => {
        if (!cls.startTime || !cls.endTime) return null
        const top = ((toMinutes(cls.startTime) - START_HOUR * 60) / 60) * HOUR_HEIGHT
        const height = Math.max(((toMinutes(cls.endTime) - toMinutes(cls.startTime)) / 60) * HOUR_HEIGHT, 24)
        return (
          <div key={cls.id} className="absolute" style={{ top, height, left: 0, right: 0 }}>
            {cls.isLunch ? <LunchBlock /> : <ClassCard cls={cls} onClick={() => onClassClick(cls.id)} compact />}
          </div>
        )
      })}
    </div>
  )
}

function CalendarPanel({ masterClasses, schedule, onClassClick }) {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const nowTimeLabel = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const nowTopRaw = ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT
  const nowTop = Math.max(0, Math.min(GRID_HEIGHT - 8, nowTopRaw))
  const todayDayShort = now.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
  const todayEntries = resolveDay(todayDayShort, masterClasses, schedule)
  const todayClasses = todayEntries.filter(item => !item.isLunch)
  const weekDays = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
    return { d, dayShort, dayClasses: resolveDay(dayShort, masterClasses, schedule), isToday: i === 0 }
  })

  return (
    <section className="mt-7">
      <div className="flex items-center gap-2">
        <CalendarBlank size={18} weight="fill" className="text-primary" />
        <h2 className="text-[17px] font-bold tracking-[-0.01em] text-foreground">Class calendar</h2>
      </div>

      <Tabs defaultValue="day" className="mt-4 rounded-[24px] border border-border bg-card">
        <div className="flex items-center justify-between px-4 pt-4">
          <p className="text-[13px] text-muted-foreground">Daily and weekly class view</p>
          <TabsList className="h-9 rounded-full bg-muted p-1">
            <TabsTrigger value="day" className="rounded-full px-3 text-[12px]">Day</TabsTrigger>
            <TabsTrigger value="week" className="rounded-full px-3 text-[12px]">Week</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="day" className="mt-0">
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div style={{ minWidth: 320 }}>
              <DateHeader isWeek={false} weekDays={[]} today={now} />
              <div className="relative flex" style={{ height: GRID_HEIGHT }}>
                <TimeColumn />

                <div className="relative flex-1">
                  {HOURS.map(hour =>
                    hour === START_HOUR ? null : (
                      <div
                        key={hour}
                        className="pointer-events-none absolute left-0 right-0"
                        style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, borderTop: '1px solid var(--border)' }}
                      />
                    )
                  )}

                  {todayClasses.length === 0 ? (
                    <div className="absolute inset-x-4 top-18 rounded-2xl border border-dashed border-border bg-card px-5 py-6 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-tint">
                        <CalendarBlank size={24} weight="fill" className="text-primary" />
                      </div>
                      <p className="mt-3 text-[16px] font-semibold text-foreground">No classes today</p>
                      <p className="mt-1 text-[13px] text-muted-foreground">Switch to Week view to plan ahead.</p>
                    </div>
                  ) : (
                    todayEntries.map(cls => {
                      if (!cls.startTime || !cls.endTime) return null
                      const top = ((toMinutes(cls.startTime) - START_HOUR * 60) / 60) * HOUR_HEIGHT
                      const height = Math.max(((toMinutes(cls.endTime) - toMinutes(cls.startTime)) / 60) * HOUR_HEIGHT, 24)
                      return (
                        <div key={cls.id} className="absolute" style={{ top, height, left: 0, right: 0 }}>
                          {cls.isLunch ? <LunchBlock /> : <ClassCard cls={cls} onClick={() => onClassClick(cls.id)} />}
                        </div>
                      )
                    })
                  )}
                </div>

                <div
                  className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                  style={{ top: nowTop }}
                >
                  <div className="flex items-center justify-end pr-1" style={{ width: TIME_COL_W - 4 }}>
                    <Badge className="h-4 rounded-sm border-0 bg-primary px-1.5 py-0 text-[10px] text-white">
                      {nowTimeLabel}
                    </Badge>
                  </div>
                  <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="h-px flex-1 bg-primary" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="week" className="mt-0">
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div style={{ width: TIME_COL_W + weekDays.length * DAY_COL_W }}>
              <DateHeader isWeek weekDays={weekDays} today={now} />
              <div className="relative flex" style={{ height: GRID_HEIGHT }}>
                <TimeColumn sticky nowTop={nowTop} nowTimeLabel={nowTimeLabel} />
                {weekDays.map(({ d, dayShort, dayClasses }, index) => (
                  <DayColumn
                    key={`${dayShort}-${d.getDate()}`}
                    classes={dayClasses}
                    onClassClick={onClassClick}
                    isFirst={index === 0}
                  />
                ))}
                <div
                  className="pointer-events-none absolute right-0 z-10 flex items-center"
                  style={{ top: nowTop, left: TIME_COL_W - 4 }}
                >
                  <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="h-px flex-1 bg-primary" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}

function MessageSection({ items, onOpenThread }) {
  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpenThread(item)}
            className="w-[220px] shrink-0 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors active:bg-muted/60"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-foreground">
                {item.title || item.content}
              </p>
              <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
                {item.subtitle || item.preview}
              </p>
              <p className="mt-2 text-[11px] font-medium text-primary">{item.replyCount} replies</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const { currentUser, getClasses, getChannelOrder, getChannel, getClassById } = useApp()
  const pushChildPage = useChildNavigation()
  const [selectedThread, setSelectedThread] = useState(null)

  const classes = getClasses()
  const schedule = currentUser?.role === 'school' ? schoolDaySchedule : collegeDaySchedule
  const channelOrder = getChannelOrder()
  const upcomingClasses = useMemo(() => getUpcomingClasses(classes, schedule), [classes, schedule])
  const nextClass = upcomingClasses[0]

  const broadcastChannel = getChannel('broadcast')
  const importantMessages = (broadcastChannel?.posts || []).slice(0, 3)
  const notificationCount = importantMessages.length
  const administrationMessages = (broadcastChannel?.posts || []).slice(0, 2).map(post => ({
    ...post,
    group: 'Messages',
    badgeLabel: 'Administration',
    preview: post.subtitle || post.content,
    replyCount: (post.doubts || []).length,
  }))
  const classMessages = channelOrder
    .filter(channelId => channelId !== 'broadcast')
    .flatMap(channelId => {
      const channel = getChannel(channelId)
      if (!channel) return []

      return (channel.posts || [])
        .filter(post => (post.doubts || []).length > 0 || post.subtitle || post.attachmentPreviewUrl)
        .slice(0, 1)
        .map(post => ({
          ...post,
          channelId,
          group: 'Messages',
          badgeLabel: getClassById(channel.classId)?.displayName || 'Class',
          className: getClassById(channel.classId)?.displayName || channel.name,
          preview: post.subtitle || post.content,
          replyCount: (post.doubts || []).length,
        }))
    })
    .slice(0, 2)

  const unresolvedChats = channelOrder
    .filter(channelId => channelId !== 'broadcast')
    .flatMap(channelId => {
      const channel = getChannel(channelId)
      if (!channel) return []

      return (channel.posts || [])
        .flatMap(post =>
          (post.doubts || [])
            .filter(doubt => doubt.status === 'pending')
            .map(doubt => ({
              id: doubt.id,
              channelId: channel.id,
              className: getClassById(channel.classId)?.displayName || channel.name,
              postTitle: post.title || post.content,
              student: doubt.student,
              text: doubt.text,
              time: doubt.time,
            }))
        )
    })
    .slice(0, 4)

  const semesterLabel = currentUser?.role === 'college' ? 'Semester 6 in progress' : 'Term 1 in progress'
  const daySummary = `${semesterLabel} • ${unresolvedChats.length} unresolved chats`
  const events = nextClass
    ? [
        {
          id: 'event-1',
          title: `${nextClass.division} class in ${CLASS_ROOMS[nextClass.id] || 'Room TBA'}`,
          meta: `${getDayLabel(nextClass.offset, nextClass.day)} • ${formatClassTime(nextClass.startTime)}`,
        },
        {
          id: 'event-2',
          title: currentUser?.role === 'school' ? 'Parent interaction window' : 'Department review huddle',
          meta: currentUser?.role === 'school' ? '3:30 PM • Staff room' : '4:00 PM • Faculty lounge',
        },
      ]
    : [
        {
          id: 'event-1',
          title: 'No scheduled classes',
          meta: 'Use calendar view to plan the week',
        },
      ]
  const reports = [
    {
      id: 'report-1',
      title: currentUser?.role === 'school' ? 'Class 6A' : 'CSE First Year',
      subject: currentUser?.role === 'school' ? 'Mathematics' : 'Programming Fundamentals',
      completed: currentUser?.role === 'school' ? 24 : 58,
      total: currentUser?.role === 'school' ? 30 : 65,
    },
    {
      id: 'report-2',
      title: currentUser?.role === 'school' ? 'Class 8C' : 'CSE Third Year',
      completed: currentUser?.role === 'school' ? 18 : 41,
      total: currentUser?.role === 'school' ? 30 : 60,
    },
  ]

  return (
    <div className="flex h-full flex-col bg-stone-50">
      <div className="flex-1 overflow-y-auto pb-24">
        <section className="relative min-h-[258px] rounded-b-[28px] bg-[#1F5A47] px-7 pt-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => pushChildPage('/communication')}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors active:bg-white/15"
              aria-label="Notifications"
            >
              <Bell size={19} weight="bold" />
              {notificationCount > 0 && (
                <span className="absolute right-1 top-1 h-4 min-w-4 rounded-full bg-white px-1 text-[10px] font-bold leading-4 text-[#1F5A47]">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>

          <div className="mt-4">
            <p className="text-[23px] font-semibold tracking-[-0.02em] text-white">
              Hello {currentUser?.name?.split(' ')[0] || 'Teacher'},
            </p>
            <h1 className="mt-2 whitespace-nowrap text-[14px] font-medium leading-5 text-white/75">
              {daySummary}
            </h1>
          </div>

          <div className="absolute left-7 right-7 -bottom-18 rounded-xl border border-border bg-card px-4 py-4 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] font-semibold text-muted-foreground">Next class to take</p>
            {nextClass ? (
              <>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
                    {nextClass.subject}
                  </h2>
                  <span className="text-[14px] text-muted-foreground">•</span>
                  <p className="text-[14px] font-medium text-muted-foreground">{nextClass.division}</p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-[14px] font-semibold text-foreground">
                    {getDayLabel(nextClass.offset, nextClass.day)} at {formatClassTime(nextClass.startTime)}
                  </p>
                  <p className="text-[14px] font-semibold text-foreground">
                    {CLASS_ROOMS[nextClass.id] || 'Room TBA'}
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-2 text-[14px] font-semibold text-foreground">No scheduled classes right now</p>
            )}

            <div className="mt-4 flex items-center gap-2">
              {nextClass && (
                <button
                  type="button"
                  onClick={() => pushChildPage(`/attendance/${nextClass.id}?mode=mark`)}
                  className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-[12px] font-medium text-foreground active:bg-muted"
                >
                  Mark attendance
                </button>
              )}
              <button
                type="button"
                onClick={() => pushChildPage('/schedule')}
                className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-[12px] font-medium text-muted-foreground active:bg-muted"
              >
                View All Classes
              </button>
            </div>
          </div>
        </section>

        <main className="px-6 pt-24">
          <section className="mt-5">
            <button
              type="button"
              onClick={() => pushChildPage('/communication')}
              className="flex w-full items-center justify-between gap-3 py-1 text-left"
            >
              <div className="flex items-start gap-2">
                <BellRinging size={18} weight="fill" className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-[17px] font-bold tracking-[-0.01em] text-foreground">Messages</h2>
                  <p className="text-[12px] text-muted-foreground">
                    Administration and class threads that need attention
                  </p>
                </div>
              </div>
              <CaretRight size={18} weight="bold" className="text-muted-foreground" />
            </button>

            <div className="mt-3">
              <MessageSection
                items={administrationMessages}
                onOpenThread={setSelectedThread}
              />
              <div className="mt-4">
                <MessageSection
                  items={classMessages}
                  onOpenThread={setSelectedThread}
                />
              </div>
            </div>
          </section>

          <section className="mt-5">
            <button
              type="button"
              onClick={() => pushChildPage('/schedule')}
              className="flex w-full items-start justify-between gap-3 py-1 text-left"
            >
              <div className="flex items-start gap-2">
                <CalendarDots size={18} weight="fill" className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-[17px] font-bold tracking-[-0.01em] text-foreground">Events</h2>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">Key things lined up for the day</p>
                </div>
              </div>
              <CaretRight size={18} weight="bold" className="text-muted-foreground" />
            </button>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {events.map(event => (
                <div key={event.id} className="w-[220px] shrink-0 rounded-2xl border border-border bg-card px-4 py-4">
                  <p className="text-[14px] font-semibold text-foreground">{event.title}</p>
                  <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{event.meta}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <button
              type="button"
              onClick={() => pushChildPage('/reports')}
              className="flex w-full items-start justify-between gap-3 py-1 text-left"
            >
              <div className="flex items-start gap-2">
                <FileText size={18} weight="fill" className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-[17px] font-bold tracking-[-0.01em] text-foreground">Reports</h2>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">Quick operational snapshots</p>
                </div>
              </div>
              <CaretRight size={18} weight="bold" className="text-muted-foreground" />
            </button>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {reports.map(report => (
                <div key={report.id} className="w-[220px] shrink-0 rounded-2xl border border-border bg-card px-4 py-4">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-[14px] font-semibold text-foreground">{report.title}</p>
                    {report.subject && (
                      <>
                        <span className="text-[12px] text-muted-foreground">•</span>
                        <p className="text-[12px] text-muted-foreground">{report.subject}</p>
                      </>
                    )}
                  </div>
                  <p className="mt-3 text-[13px] font-medium text-foreground">
                    {report.completed}/{report.total} reports completed
                  </p>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>

      <BottomNav />

      <BottomSheet
        isOpen={Boolean(selectedThread)}
        onClose={() => setSelectedThread(null)}
        title={selectedThread?.group || 'Thread'}
      >
        {selectedThread && (
          <div className="px-4 py-4">
            <div className="rounded-xl bg-muted p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-foreground">{selectedThread.author}</p>
                  {selectedThread.className && (
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{selectedThread.className}</p>
                  )}
                </div>
                <span className="shrink-0 text-[12px] text-muted-foreground">{selectedThread.time}</span>
              </div>
              <p className="mt-3 text-[15px] font-semibold text-foreground">
                {selectedThread.title || selectedThread.content}
              </p>
              {(selectedThread.subtitle || selectedThread.preview) && (
                <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                  {selectedThread.subtitle || selectedThread.preview}
                </p>
              )}
            </div>

            <div className="mt-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Responses
              </p>
              {(selectedThread.doubts || []).length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center">
                  <p className="text-[14px] font-semibold text-foreground">No responses yet</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    New replies and responses will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-3 flex flex-col divide-y divide-border/70 rounded-xl border border-border bg-card">
                  {selectedThread.doubts.map(reply => (
                    <div key={reply.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-semibold text-foreground">{reply.student}</p>
                        <span className="text-[11px] text-muted-foreground">{reply.time}</span>
                      </div>
                      <p className="mt-1 text-[13px] leading-5 text-foreground">{reply.text}</p>
                      {reply.teacherReply && (
                        <div className="mt-2 rounded-lg bg-brand-tint px-3 py-2">
                          <p className="text-[11px] font-semibold text-primary">{currentUser?.name}</p>
                          <p className="mt-0.5 text-[12px] leading-5 text-foreground">{reply.teacherReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedThread.channelId && (
              <button
                type="button"
                onClick={() => {
                  const target = selectedThread.channelId
                  setSelectedThread(null)
                  pushChildPage(`/channel/${target}`)
                }}
                className="mt-4 h-10 w-full rounded-lg bg-primary text-[13px] font-semibold text-white active:opacity-90"
              >
                Open full conversation
              </button>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
