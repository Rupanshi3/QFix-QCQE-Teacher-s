import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, ChatCircle, ClipboardText, FilePlus, ChartBar, MegaphoneSimple, Plus, Sparkle,
} from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { useChildNavigation } from '../lib/pageTransitions'
import { collegeDaySchedule, schoolDaySchedule } from '../data/seed'
import AssignmentCard from '../components/AssignmentCard'
import AssignmentForm from '../components/AssignmentForm'
import BottomSheet from '../components/BottomSheet'
import { formatDueDate } from '../lib/utils'
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

function getPostTag(post) {
  if (post.type === 'assignment') {
    return {
      label: 'Assignment',
      className: 'bg-amber-50 text-amber-800 border-amber-200',
    }
  }

  if (post.type === 'poll') {
    return {
      label: 'Poll',
      className: 'bg-violet-50 text-violet-800 border-violet-200',
    }
  }

  if (post.type === 'diary') {
    return {
      label: 'E-diary',
      className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    }
  }

  if (post.type === 'reschedule') {
    return {
      label: 'Rescheduled',
      className: 'bg-amber-50 text-amber-800 border-amber-200',
    }
  }

  if ((post.type === 'circular' || post.type === 'announcement') && post.announcementTone === 'priority') {
    return {
      label: 'High priority',
      className: 'bg-rose-50 text-rose-800 border-rose-200',
    }
  }

  if (post.type === 'circular' || post.type === 'announcement') {
    return {
      label: post.announcementTone === 'event' ? 'Event' : 'Circular',
      className: post.announcementTone === 'event'
        ? 'bg-violet-50 text-violet-800 border-violet-200'
        : 'bg-sky-50 text-sky-800 border-sky-200',
    }
  }

  return {
    label: 'Message',
    className: 'bg-muted text-muted-foreground border-border',
  }
}

function getAvatarDateParts(dateString) {
  if (!dateString) return { day: '--', month: '--' }
  const parsed = new Date(dateString)
  if (Number.isNaN(parsed.getTime())) return { day: '--', month: '--' }

  return {
    day: parsed.toLocaleString('en-IN', { day: 'numeric' }),
    month: parsed.toLocaleString('en-IN', { month: 'short' }),
  }
}

function getAttachmentDetails(post) {
  const name = post.attachmentName || post.homework || ''
  const previewUrl = post.attachmentPreviewUrl || ''
  const type = post.attachmentType || ''
  const extension = name.split('.').pop()?.toLowerCase() || ''
  const isImage = type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)

  return { name, previewUrl, isImage }
}

export default function ClassWorkspace() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const pushChildPage = useChildNavigation()
  const {
    currentUser,
    getClassById,
    getAssignmentsForClass,
    getChannel,
    addPost,
    addAssignment,
    rescheduleClass,
    allStudents,
  } = useApp()

  const cls = getClassById(classId)
  const assignments = getAssignmentsForClass(classId)
  const channel = cls?.channelId ? getChannel(cls.channelId) : null

  const [sheetMode, setSheetMode] = useState(null)
  const [composerKind, setComposerKind] = useState('circular')
  const [postTitle, setPostTitle] = useState('')
  const [postSubtitle, setPostSubtitle] = useState('')
  const [postTargetStudentId, setPostTargetStudentId] = useState('')
  const [postTone, setPostTone] = useState('message')
  const [postAttachmentName, setPostAttachmentName] = useState('')
  const [postAttachmentType, setPostAttachmentType] = useState('')
  const [postAttachmentPreviewUrl, setPostAttachmentPreviewUrl] = useState('')
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [pollDeadline, setPollDeadline] = useState('')
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

  const resetComposer = () => {
    setSheetMode(null)
    setComposerKind('circular')
    setPostTitle('')
    setPostSubtitle('')
    setPostTargetStudentId('')
    setPostTone('message')
    setPostAttachmentName('')
    setPostAttachmentType('')
    setPostAttachmentPreviewUrl('')
    setPollQuestion('')
    setPollOptions(['', ''])
    setPollDeadline('')
  }

  const handlePostAssignment = ({ title, description, dueDate }) => {
    addAssignment(classId, { title, description, dueDate })
    resetComposer()
  }

  const handlePostSubmit = () => {
    if (!postTitle.trim() || !cls?.channelId) return
    const targetStudent = allStudents.find(student => String(student.id) === postTargetStudentId)

    addPost(cls.channelId, postTitle.trim(), postSubtitle.trim(), {
      type: composerKind,
      targetClassId: classId,
      targetStudentId: targetStudent?.id || null,
      targetStudentName: targetStudent?.name || '',
      announcementTone: postTone,
      homework: postAttachmentName || '',
      attachmentName: postAttachmentName || '',
      attachmentType: postAttachmentType || '',
      attachmentPreviewUrl: postAttachmentPreviewUrl || '',
    })
    showToast(composerKind === 'diary' ? 'E-diary posted' : 'Circular posted')
    resetComposer()
  }

  const handlePollSubmit = () => {
    const options = pollOptions.map(option => option.trim()).filter(Boolean)
    if (!pollQuestion.trim() || options.length < 2 || !pollDeadline || !cls?.channelId) return

    addPost(cls.channelId, pollQuestion.trim(), '', {
      type: 'poll',
      pollOptions: options.map((label, index) => ({
        id: `option-${index}`,
        label,
        votes: index === 0 ? 18 : index === 1 ? 11 : 0,
      })),
      pollDeadline,
    })
    showToast('Poll posted')
    resetComposer()
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
    resetComposer()
  }

  const visibleAssignments = assignments.slice(0, 2)
  const feedPosts = [...(channel?.posts || [])].reverse()
  const showWorkspaceFeed = classId !== 'sc-7a'
  const showEmptyComposerState = classId === 'sc-7a'
  const sheetTitle = sheetMode === 'choose'
    ? 'Create New'
    : sheetMode === 'post'
    ? composerKind === 'diary'
      ? 'New E-diary'
      : 'New Circular'
    : sheetMode === 'poll'
    ? 'New Poll'
    : sheetMode === 'assignment'
    ? 'New Assignment'
    : sheetMode === 'reschedule'
    ? 'Reschedule Class'
    : 'Class Workspace'

  return (
    <div className="h-full flex flex-col bg-stone-50 relative">
      <div className="flex-1 overflow-y-auto pb-28">
        <section className="relative min-h-[196px] rounded-b-[28px] bg-primary px-7 pt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 -ml-3 flex items-center justify-center rounded-full text-primary-foreground active:bg-white/10 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={26} weight="regular" />
            </button>
            <h1 className="min-w-0 truncate text-[23px] leading-tight font-semibold tracking-[-0.02em] text-primary-foreground">
              {cls.subject}
            </h1>
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
          {showEmptyComposerState ? (
            <ClassWorkspaceEmptyState
              onCreateAssignment={() => setSheetMode('assignment')}
              onCreateCircular={() => {
                setComposerKind('circular')
                setSheetMode('post')
              }}
              onCreateDiary={() => {
                setComposerKind('diary')
                setSheetMode('post')
              }}
              onCreatePoll={() => setSheetMode('poll')}
            />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-[17px] font-bold text-foreground tracking-[-0.01em]">Assignments</h2>
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
            </>
          )}

          {showWorkspaceFeed && (
            <>
              <div className="mt-7">
                <h2 className="text-[17px] font-bold text-foreground tracking-[-0.01em]">Class feed</h2>
              </div>

              <div className="mt-4">
                {feedPosts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-tint text-primary">
                      <ChatCircle size={24} weight="fill" />
                    </div>
                    <p className="mt-3 text-[15px] font-semibold text-foreground">No class updates yet</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                      Posts, circulars, assignments, and polls will show here for this class.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/70">
                    {feedPosts.map(post => (
                      <WorkspaceFeedRow key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {!showEmptyComposerState && (
        <button
          onClick={() => setSheetMode('choose')}
          className="absolute bottom-6 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform active:scale-95"
          aria-label="Create from class page"
        >
          <Plus size={24} weight="bold" color="white" />
        </button>
      )}

      <BottomSheet isOpen={Boolean(sheetMode)} onClose={resetComposer} title={sheetTitle}>
        {sheetMode === 'choose' && (
          <div className="px-4 pt-4 flex flex-col gap-3">
            <button
              onClick={() => {
                setComposerKind('circular')
                setSheetMode('post')
              }}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors active:bg-muted"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-tint">
                <MegaphoneSimple size={20} weight="fill" className="text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Circulars</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">Send a class update with homework, priority, or event marking</p>
              </div>
            </button>

            <button
              onClick={() => setSheetMode('assignment')}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors active:bg-muted"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-tint">
                <ClipboardText size={20} weight="fill" className="text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Assignment</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">Create and assign work with a due date</p>
              </div>
            </button>

            <button
              onClick={() => setSheetMode('poll')}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors active:bg-muted"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-tint">
                <ChartBar size={20} weight="fill" className="text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Poll</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">Ask students to vote before a deadline</p>
              </div>
            </button>

            <button
              onClick={() => {
                setComposerKind('diary')
                setSheetMode('post')
              }}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors active:bg-muted"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-tint">
                <Sparkle size={20} weight="fill" className="text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">E-diary</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">Create a diary note for the class or a selected student</p>
              </div>
            </button>
          </div>
        )}

        {sheetMode === 'post' && (
          <div className="px-4 pt-4 flex flex-col gap-4">
            {composerKind === 'diary' && (
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-foreground">
                  Student <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={postTargetStudentId}
                    onChange={e => setPostTargetStudentId(e.target.value)}
                    className="h-12 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-10 text-[15px] font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <option value="">Entire class diary</option>
                    {allStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">⌄</span>
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-foreground">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                placeholder={composerKind === 'diary' ? 'e.g. Homework for tomorrow' : "e.g. Tomorrow's class timing is updated"}
                className="h-12 rounded-lg border-border text-[15px]"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-foreground">
                {composerKind === 'diary' ? 'Diary note' : 'Message'} <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                value={postSubtitle}
                onChange={e => setPostSubtitle(e.target.value)}
                placeholder={composerKind === 'diary' ? 'Add reminders, notebook notes, or student-specific details…' : 'Add the main circular, reminder, or instruction…'}
                rows={3}
                className="resize-none rounded-lg border-border text-[15px]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-foreground">
                Homework attachment <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <label className="flex h-12 w-full cursor-pointer items-center rounded-lg border border-border bg-background px-3 text-[15px] text-muted-foreground">
                <span className="truncate">{postAttachmentName || 'Choose a file'}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    setPostAttachmentName(file?.name || '')
                    setPostAttachmentType(file?.type || '')
                    setPostAttachmentPreviewUrl(file && file.type.startsWith('image/') ? URL.createObjectURL(file) : '')
                  }}
                  className="sr-only"
                />
              </label>
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG. Max file size: 10MB.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <label className="mb-2 block text-[13px] font-medium text-foreground">Mark as</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'message', label: 'Message' },
                  { value: 'priority', label: 'Priority' },
                  { value: 'event', label: 'Event' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPostTone(option.value)}
                    className={`h-11 rounded-lg border text-[13px] font-semibold ${
                      postTone === option.value
                        ? 'border-primary bg-brand-tint text-primary'
                        : 'border-border bg-background text-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="h-12 w-full rounded-lg text-[15px] font-semibold"
              onClick={handlePostSubmit}
              disabled={!postTitle.trim()}
            >
              Send
            </Button>
          </div>
        )}

        {sheetMode === 'poll' && (
          <div className="px-4 pt-4 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-foreground">
                Poll question <span className="text-destructive">*</span>
              </label>
              <Input
                value={pollQuestion}
                onChange={e => setPollQuestion(e.target.value)}
                placeholder="e.g. Which topic should we revise first?"
                className="h-12 rounded-lg border-border text-[15px]"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-3">
              {pollOptions.map((option, index) => (
                <div key={index}>
                  <label className="mb-1.5 block text-[13px] font-medium text-foreground">
                    Option {index + 1} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={option}
                    onChange={e => {
                      const next = [...pollOptions]
                      next[index] = e.target.value
                      setPollOptions(next)
                    }}
                    placeholder={index === 0 ? 'e.g. Functions' : 'e.g. Recursion'}
                    className="h-12 rounded-lg border-border text-[15px]"
                  />
                </div>
              ))}
              {pollOptions.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-lg border-border text-foreground"
                  onClick={() => setPollOptions(prev => [...prev, ''])}
                >
                  Add option
                </Button>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-foreground">
                Voting deadline <span className="text-destructive">*</span>
              </label>
              <Input
                type="datetime-local"
                value={pollDeadline}
                onChange={e => setPollDeadline(e.target.value)}
                className="h-12 rounded-lg border-border text-[15px]"
              />
            </div>

            <Button
              className="h-12 w-full rounded-lg text-[15px] font-semibold"
              onClick={handlePollSubmit}
              disabled={!pollQuestion.trim() || pollOptions.filter(option => option.trim()).length < 2 || !pollDeadline}
            >
              Post Poll
            </Button>
          </div>
        )}

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

function WorkspaceFeedRow({ post }) {
  const tag = getPostTag(post)
  const avatarDate = getAvatarDateParts(post.date)
  const attachment = getAttachmentDetails(post)
  const isAssignment = post.type === 'assignment'
  const isPoll = post.type === 'poll'
  const isDiary = post.type === 'diary'
  const dueLabel = formatDueDate(post.dueDate)
  const totalVotes = post.pollOptions?.reduce((sum, option) => sum + option.votes, 0) || 0

  return (
    <div className="py-4">
      <div className="flex gap-3">
        <div
          className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-xl border leading-none"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-avatar-accent) 10%, white)',
            color: 'var(--color-primary)',
            borderColor: 'color-mix(in srgb, var(--color-avatar-accent) 18%, var(--color-border))',
          }}
        >
          <span className="text-[13px] font-bold">{avatarDate.day}</span>
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] opacity-80">
            {avatarDate.month}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-h-6 items-center gap-2">
            <span className="truncate text-[16px] font-bold leading-tight text-foreground">
              {post.author}
            </span>
            {isDiary && (
              <span className="truncate text-[12px] font-medium leading-tight text-primary/80">
                @{post.targetStudentName || 'class'}
              </span>
            )}
            <span className={`ml-auto inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tag.className}`}>
              {tag.label}
            </span>
          </div>

          <div className="mt-1">
            <p className="text-sm font-semibold text-foreground">{post.title || post.content}</p>
            {post.subtitle && (
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">{post.subtitle}</p>
            )}

            {isAssignment && (
              <p className="mt-2 text-[12px] text-muted-foreground">{dueLabel}</p>
            )}

            {isPoll && (
              <div className="mt-3 flex flex-col gap-2">
                {post.pollOptions?.map(option => {
                  const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0

                  return (
                    <div
                      key={option.id}
                      className="relative overflow-hidden rounded-lg border border-border bg-card px-3 py-2"
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-brand-tint"
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="relative flex items-center justify-between gap-3">
                        <span className="text-[13px] font-medium text-foreground">{option.label}</span>
                        <span className="text-[12px] font-semibold text-primary">{percentage}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {attachment.isImage && attachment.previewUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
                <img
                  src={attachment.previewUrl}
                  alt={attachment.name || post.title || 'Attachment'}
                  className="h-44 w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
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

function ClassWorkspaceEmptyState({
  onCreateAssignment,
  onCreateCircular,
  onCreateDiary,
  onCreatePoll,
}) {
  const actions = [
    {
      label: 'Create assignment',
      helper: 'Post the first class assignment with a due date.',
      cta: 'Create assignment',
      onClick: onCreateAssignment,
      icon: <ClipboardText size={18} weight="fill" className="text-primary" />,
    },
    {
      label: 'Write circular',
      helper: 'Share announcements, homework, or class updates.',
      cta: 'Write circular',
      onClick: onCreateCircular,
      icon: <MegaphoneSimple size={18} weight="fill" className="text-primary" />,
    },
    {
      label: 'Add e-diary',
      helper: 'Create a diary note for the class or a student.',
      cta: 'Add e-diary',
      onClick: onCreateDiary,
      icon: <Sparkle size={18} weight="fill" className="text-primary" />,
    },
    {
      label: 'Start poll',
      helper: 'Ask students to vote before a deadline.',
      cta: 'Start poll',
      onClick: onCreatePoll,
      icon: <ChartBar size={18} weight="fill" className="text-primary" />,
    },
  ]

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-6">
      <div className="relative mx-auto h-24 w-28">
        <div className="absolute inset-x-4 bottom-2 h-14 rounded-3xl bg-brand-tint" />
        <div className="absolute left-6 top-5 h-14 w-11 rotate-[-8deg] rounded-xl border border-primary/20 bg-white shadow-sm" />
        <div className="absolute right-6 top-3 h-16 w-12 rotate-[8deg] rounded-xl border border-primary/20 bg-white shadow-sm" />
        <div className="absolute left-1/2 top-8 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Plus size={24} weight="bold" />
        </div>
      </div>
      <p className="mt-3 text-center text-[15px] font-semibold text-foreground">Nothing created yet</p>
      <p className="mt-1 text-center text-[13px] leading-relaxed text-muted-foreground">
        Start this class by creating an assignment, circular, e-diary, or poll.
      </p>

      <div className="mt-5 flex flex-col divide-y divide-border/70">
        {actions.map(action => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="flex items-start gap-3 py-3 text-left first:pt-0 last:pb-0 active:opacity-80"
          >
            <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-tint">
              {action.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-foreground">{action.label}</p>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{action.helper}</p>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation()
                    action.onClick()
                  }}
                  className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-[12px] font-semibold text-primary active:bg-brand-tint/60"
                >
                  <Plus size={12} weight="bold" />
                  {action.cta}
                </button>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
