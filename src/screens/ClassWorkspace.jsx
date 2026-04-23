import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, ChatCircle, CheckCircle, ClipboardText, ClockCounterClockwise, FilePlus, Users,
} from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { useChildNavigation } from '../lib/pageTransitions'
import { collegeDaySchedule, schoolDaySchedule } from '../data/seed'
import AssignmentCard from '../components/AssignmentCard'
import AssignmentForm from '../components/AssignmentForm'
import BottomSheet from '../components/BottomSheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { showToast } from '../components/Toast'
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

function formatClassTime(time) {
  if (!time) return ''
  const [hourString, minute] = time.split(':')
  const hour = Number(hourString)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalizedHour = hour % 12 || 12
  return `${normalizedHour}:${minute} ${suffix}`
}

function getNextClassSlot(classId, role) {
  const schedule = role === 'school' ? schoolDaySchedule : collegeDaySchedule
  const todayIndex = new Date().getDay()

  return Object.entries(schedule)
    .flatMap(([day, slots]) =>
      slots
        .filter(slot => slot.classId === classId)
        .map(slot => {
          const dayIndex = WEEKDAY_ORDER.indexOf(day)
          let offset = dayIndex - todayIndex
          if (offset < 0) offset += 7
          return { ...slot, day, offset }
        })
    )
    .sort((a, b) => {
      if (a.offset !== b.offset) return a.offset - b.offset
      return a.startTime.localeCompare(b.startTime)
    })[0]
}

function getDayLabel(slot) {
  if (!slot) return 'Today'
  if (slot.offset === 0) return 'Today'
  if (slot.offset === 1) return 'Tomorrow'
  return slot.day
}

export default function ClassWorkspace() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const pushChildPage = useChildNavigation()
  const {
    currentUser,
    getClassById,
    getAssignmentsForClass,
    addAssignment,
    rescheduleClass,
  } = useApp()

  const cls = getClassById(classId)
  const assignments = getAssignmentsForClass(classId)

  const [sheetMode, setSheetMode] = useState(null)
  const [scheduleDay, setScheduleDay] = useState('Friday')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('2:00 PM - 3:00 PM')
  const [scheduleRoom, setScheduleRoom] = useState('Lab 2')
  const [scheduleNote, setScheduleNote] = useState('')

  if (!cls) return null

  const isMarked = cls.attendance === 'marked'
  const nextClassSlot = getNextClassSlot(classId, currentUser?.role)
  const nextClassDay = getDayLabel(nextClassSlot)
  const nextClassTime = nextClassSlot?.startTime ? formatClassTime(nextClassSlot.startTime) : '4:00 PM'
  const roomLabel = CLASS_ROOMS[classId] || 'Room TBA'

  const handlePostAssignment = ({ title, description, dueDate }) => {
    addAssignment(classId, { title, description, dueDate })
    setSheetMode(null)
  }

  const handleReschedule = () => {
    if (!scheduleDay.trim() || !scheduleTime.trim()) return
    rescheduleClass(classId, {
      day: scheduleDay.trim(),
      date: scheduleDate,
      time: scheduleTime.trim(),
      room: scheduleRoom.trim(),
      note: scheduleNote.trim(),
    })
    showToast('Students notified about the reschedule')
    setSheetMode(null)
  }

  const visibleAssignments = assignments.slice(0, 2)
  const sheetTitle = sheetMode === 'assignment'
    ? 'New Assignment'
    : sheetMode === 'reschedule'
    ? 'Reschedule Class'
    : 'Class Workspace'

  return (
    <div className="h-full flex flex-col bg-stone-50 relative">
      <div className="flex-1 overflow-y-auto pb-28">
        <section className="relative min-h-[268px] rounded-b-[28px] bg-primary px-7 pt-6">
          <div className="flex items-start justify-between">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 -ml-3 flex items-center justify-center rounded-full text-primary-foreground active:bg-white/10 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={26} weight="regular" />
            </button>

            <div className="h-10 rounded-full border border-white/20 bg-white/10 text-primary-foreground flex items-center overflow-hidden shadow-sm">
              <button
                onClick={() => pushChildPage(`/students/${classId}`)}
                className="h-full px-3 flex items-center gap-1.5 text-[12px] font-semibold active:bg-white/10"
                aria-label={`${cls.totalStudents} enrolled students`}
              >
                <Users size={17} weight="bold" />
                {cls.totalStudents}
              </button>
              <span className="h-5 w-px bg-white/30" />
              <button
                onClick={() => pushChildPage(`/attendance/${classId}`)}
                className="h-full px-3 flex items-center text-[12px] font-semibold active:bg-white/10"
                aria-label="Attendance history"
              >
                {isMarked ? (
                  <CheckCircle size={17} weight="fill" />
                ) : (
                  <ClockCounterClockwise size={17} weight="bold" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-[14px] text-primary-foreground/75 font-medium">{cls.division}</p>
            <h1 className="mt-2 text-[23px] leading-tight font-semibold text-primary-foreground tracking-[-0.02em]">{cls.subject}</h1>
          </div>

          <div className="absolute left-7 right-7 -bottom-14 rounded-xl border border-border bg-card px-4 py-4 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] font-semibold text-muted-foreground">Next class:</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-[14px] font-semibold text-foreground">{nextClassDay} at {nextClassTime}</p>
              <p className="text-[14px] font-semibold text-foreground">{roomLabel}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => pushChildPage(`/attendance/${classId}?mode=mark`)}
                className="h-9 rounded-md border border-border bg-background text-[12px] font-medium text-foreground active:bg-muted"
              >
                {isMarked ? 'Edit attendance' : 'Mark Attendance'}
              </button>
              <button
                onClick={() => pushChildPage(`/attendance/${classId}`)}
                className="h-9 rounded-md border border-border bg-background text-[12px] font-medium text-foreground active:bg-muted"
              >
                History
              </button>
            </div>
          </div>
        </section>

        <main className="px-6 pt-24">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-foreground tracking-[-0.01em]">Assignments</h2>
            <button
              onClick={() => setSheetMode('assignment')}
              className="h-8 px-3 rounded-full text-[12px] font-semibold bg-card border border-border text-foreground active:bg-muted"
            >
              + New
            </button>
          </div>

          <div className="mt-4">
            {visibleAssignments.length === 0 ? (
              <EmptyAssignmentState onCreate={() => setSheetMode('assignment')} />
            ) : (
              <div className="divide-y divide-border/70">
                {visibleAssignments.map(asgn => (
                  <AssignmentCard
                    key={asgn.id}
                    assignment={asgn}
                    onClick={() => pushChildPage(`/assignment/${asgn.id}?classId=${classId}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <button
        onClick={() => pushChildPage(`/channel/${cls.channelId}`)}
        className="absolute bottom-5 right-6 min-w-[124px] h-10 rounded-md border border-border bg-card px-4 text-[12px] font-medium text-foreground flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
      >
        <ChatCircle size={16} weight="bold" className="text-primary" />
        Chat with class
      </button>

      <BottomSheet isOpen={Boolean(sheetMode)} onClose={() => setSheetMode(null)} title={sheetTitle}>
        {sheetMode === 'assignment' && (
          <AssignmentForm onSubmit={handlePostAssignment} showDescription showAttach />
        )}

        {sheetMode === 'reschedule' && (
          <div className="px-4 pt-4 flex flex-col gap-4">
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                New day <span className="text-destructive">*</span>
              </label>
              <Input
                value={scheduleDay}
                onChange={e => setScheduleDay(e.target.value)}
                placeholder="e.g. Friday"
                className="h-12 rounded-lg text-[15px] border-border"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                Date <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                className="h-12 rounded-lg text-[15px] border-border"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                New time <span className="text-destructive">*</span>
              </label>
              <Input
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                placeholder="e.g. 2:00 PM - 3:00 PM"
                className="h-12 rounded-lg text-[15px] border-border"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                Room <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                value={scheduleRoom}
                onChange={e => setScheduleRoom(e.target.value)}
                placeholder="e.g. Lab 2"
                className="h-12 rounded-lg text-[15px] border-border"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                Note to students <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                value={scheduleNote}
                onChange={e => setScheduleNote(e.target.value)}
                placeholder="e.g. Please bring your lab manual."
                rows={3}
                className="rounded-lg text-[15px] border-border resize-none"
              />
            </div>
            <Button
              className="w-full h-12 text-[15px] font-semibold rounded-lg"
              onClick={handleReschedule}
              disabled={!scheduleDay.trim() || !scheduleTime.trim()}
            >
              Notify Students
            </Button>
          </div>
        )}

      </BottomSheet>
    </div>
  )
}

function EmptyAssignmentState({ onCreate }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-6 text-center">
      <div className="relative mx-auto h-24 w-28">
        <div className="absolute inset-x-4 bottom-2 h-14 rounded-3xl bg-brand-tint" />
        <div className="absolute left-6 top-5 h-14 w-11 rotate-[-8deg] rounded-xl border border-primary/20 bg-white shadow-sm" />
        <div className="absolute right-6 top-3 h-16 w-12 rotate-[8deg] rounded-xl border border-primary/20 bg-white shadow-sm" />
        <div className="absolute left-1/2 top-8 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <ClipboardText size={24} weight="duotone" />
        </div>
        <div className="absolute right-4 bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-primary">
          <FilePlus size={16} weight="bold" />
        </div>
      </div>
      <p className="mt-3 text-[15px] font-semibold text-foreground">No assignments yet</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
        Create the first assignment for this class and it will appear here.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-4 h-10 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground active:scale-95 transition-transform"
      >
        Create assignment
      </button>
    </div>
  )
}
