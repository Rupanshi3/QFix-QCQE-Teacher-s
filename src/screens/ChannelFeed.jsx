import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, CaretDown, PaperPlaneTilt, ClipboardText, ChartBar, Plus, Lock,
  ChatCircle, BookmarkSimple, PaperPlaneRight, MegaphoneSimple, Sparkle,
} from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { formatDueDate, formatDateLabel } from '../lib/utils'
import { allStudents } from '../data/seed'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import BottomSheet from '../components/BottomSheet'
import AssignmentForm from '../components/AssignmentForm'
import { showToast } from '../components/Toast'

function groupPostsByDate(posts) {
  const groups = []
  let currentDate = null
  for (const post of posts) {
    if (post.date !== currentDate) {
      currentDate = post.date
      groups.push({ date: currentDate, label: formatDateLabel(currentDate), posts: [] })
    }
    groups[groups.length - 1].posts.push(post)
  }
  return groups
}

function isHighPriorityPost(post) {
  return (post.type === 'circular' || post.type === 'announcement') && post.announcementTone === 'priority'
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

  if (isHighPriorityPost(post)) {
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
  if (!dateString) {
    return { day: '--', month: '--' }
  }

  const parsed = new Date(dateString)
  if (Number.isNaN(parsed.getTime())) {
    return { day: '--', month: '--' }
  }

  return {
    day: parsed.toLocaleString('en-IN', { day: 'numeric' }),
    month: parsed.toLocaleString('en-IN', { month: 'short' }),
  }
}

const avatarAccentStyle = {
  backgroundColor: 'color-mix(in srgb, var(--color-avatar-accent) 10%, white)',
  color: 'var(--color-primary)',
  border: '1px solid color-mix(in srgb, var(--color-avatar-accent) 18%, var(--color-border))',
}

function getAttachmentDetails(post) {
  const name = post.attachmentName || post.homework || ''
  const previewUrl = post.attachmentPreviewUrl || ''
  const type = post.attachmentType || ''
  const extension = name.split('.').pop()?.toLowerCase() || ''
  const isImage = type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)

  return { name, previewUrl, type, isImage }
}

export default function ChannelFeed() {
  const { channelId } = useParams()
  const navigate = useNavigate()
  const { getChannel, getClasses, getClassById, addPost, addAssignment, updatePost, markChannelRead } = useApp()
  const ch = getChannel(channelId)
  const classes = getClasses()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [step, setStep] = useState('choose') // 'choose' | 'post' | 'poll' | 'assignment'
  const [postKind, setPostKind] = useState('circular')
  const [postTitle, setPostTitle] = useState('')
  const [postSubtitle, setPostSubtitle] = useState('')
  const [postTargetClassId, setPostTargetClassId] = useState('')
  const [postTargetStudentId, setPostTargetStudentId] = useState('')
  const [postTone, setPostTone] = useState('message')
  const [postHomework, setPostHomework] = useState('')
  const [postAttachmentName, setPostAttachmentName] = useState('')
  const [postAttachmentType, setPostAttachmentType] = useState('')
  const [postAttachmentPreviewUrl, setPostAttachmentPreviewUrl] = useState('')
  const [postPollEnabled, setPostPollEnabled] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [pollDeadline, setPollDeadline] = useState('')
  const [savedSheetOpen, setSavedSheetOpen] = useState(false)
  const [savedPostIds, setSavedPostIds] = useState([])
  const initializedSavedChannelsRef = useRef(new Set())
  const feedRef = useRef(null)

  // Mark channel as read on mount
  useEffect(() => {
    if (channelId) markChannelRead(channelId)
  }, [channelId, markChannelRead])

  // Scroll to bottom when posts change
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [ch?.posts?.length])

  if (!ch) {
    return (
      <div className="h-full flex items-center justify-center bg-stone-50">
        <p className="text-[15px] text-muted-foreground">Channel not found</p>
      </div>
    )
  }

  const resetSheet = () => {
    setSheetOpen(false)
    setStep('choose')
    setPostKind('circular')
    setPostTitle('')
    setPostSubtitle('')
    setPostTargetClassId(ch?.classId || '')
    setPostTargetStudentId('')
    setPostTone('message')
    setPostHomework('')
    setPostAttachmentName('')
    setPostAttachmentType('')
    setPostAttachmentPreviewUrl('')
    setPostPollEnabled(false)
    setPollQuestion('')
    setPollOptions(['', ''])
    setPollDeadline('')
  }

  const handlePostSubmit = () => {
    if (!postTitle.trim()) return
    const options = pollOptions.map(option => option.trim()).filter(Boolean)
    if (postPollEnabled && (options.length < 2 || !pollDeadline)) return
    const targetClass = getClassById(postTargetClassId) || getClassById(ch.classId)
    const targetChannelId = targetClass?.channelId || channelId
    const targetStudent = allStudents.find(student => String(student.id) === postTargetStudentId)

    addPost(
      targetChannelId,
      postTitle.trim(),
      postSubtitle.trim(),
      postPollEnabled
        ? {
            type: 'poll',
            pollOptions: options.map((label, index) => ({
              id: `option-${index}`,
              label,
              votes: index === 0 ? 18 : index === 1 ? 11 : 0,
            })),
            pollDeadline,
          }
        : {
            type: postKind,
            targetClassId: targetClass?.id || ch.classId,
            targetStudentId: targetStudent?.id || null,
            targetStudentName: targetStudent?.name || '',
            announcementTone: postTone,
            homework: postAttachmentName || postHomework.trim(),
            attachmentName: postAttachmentName || '',
            attachmentType: postAttachmentType || '',
            attachmentPreviewUrl: postAttachmentPreviewUrl || '',
          }
    )
    showToast('Post sent')
    resetSheet()
  }

  const handlePollSubmit = () => {
    const options = pollOptions.map(option => option.trim()).filter(Boolean)
    if (!pollQuestion.trim() || options.length < 2 || !pollDeadline) return

    addPost(channelId, pollQuestion.trim(), '', {
      type: 'poll',
      pollOptions: options.map((label, index) => ({
        id: `option-${index}`,
        label,
        votes: index === 0 ? 18 : index === 1 ? 11 : 0,
      })),
      pollDeadline,
    })
    showToast('Poll posted')
    resetSheet()
  }

  const handleAssignmentSubmit = ({ title, description, dueDate }) => {
    addAssignment(ch.classId, { title, description: description || null, dueDate: dueDate || 'TBD' })
    showToast('Assignment posted')
    resetSheet()
  }

  const handleSaveToggle = (post) => {
    setSavedPostIds(prev => {
      const isSaved = prev.includes(post.id)
      showToast(isSaved ? 'Removed from saved posts' : 'Saved to your study diary')
      return isSaved ? prev.filter(id => id !== post.id) : [...prev, post.id]
    })
  }

  useEffect(() => {
    if (ch?.classId) {
      setPostTargetClassId(ch.classId)
    }
  }, [ch?.classId])

  useEffect(() => {
    if (!ch?.id || initializedSavedChannelsRef.current.has(ch.id)) return

    const defaultSavedIds = [...ch.posts]
      .filter(post => ['circular', 'announcement', 'assignment', 'diary', 'poll'].includes(post.type))
      .slice(0, 3)
      .map(post => post.id)

    setSavedPostIds(defaultSavedIds)
    initializedSavedChannelsRef.current.add(ch.id)
  }, [ch])

  const sheetTitle = step === 'choose'
    ? 'Create New'
    : step === 'post'
    ? postKind === 'diary'
      ? 'New E-diary'
      : 'New Circular'
    : step === 'poll'
    ? 'New Poll'
    : 'New Assignment'

  // Reverse posts so oldest is at top, newest at bottom (chat convention)
  const chronologicalPosts = [...ch.posts].reverse()
  const savedPosts = chronologicalPosts.filter(post => savedPostIds.includes(post.id))
  const priorityPosts = chronologicalPosts.filter(isHighPriorityPost)
  const regularPosts = chronologicalPosts.filter(post => !isHighPriorityPost(post))
  const priorityDateGroups = groupPostsByDate(priorityPosts)
  const regularDateGroups = groupPostsByDate(regularPosts)

  const renderFeedGroups = (groups) => groups.map(group => (
    <div key={group.date}>
      {group.posts.map((post, index) => (
        <div key={post.id}>
          <MessageRow
            post={post}
            isSaved={savedPostIds.includes(post.id)}
            onSaveToggle={handleSaveToggle}
            onUpdatePost={(postId, updates) => updatePost(channelId, postId, updates)}
          />
          {index < group.posts.length - 1 && (
            <div className="my-4 h-px bg-border" />
          )}
        </div>
      ))}
    </div>
  ))

  return (
    <div className="h-full flex flex-col bg-stone-50 relative">
      {/* Header */}
      <div className="bg-card border-b border-border px-3 pt-3 pb-3 flex items-center gap-2.5 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-muted transition-colors flex-shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={20} color="var(--color-foreground)" weight="bold" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-semibold text-foreground truncate">{ch.name}</h1>
          {ch.readOnly && (
            <div className="flex items-center gap-1 mt-0.5">
              <Lock size={10} className="text-muted-foreground" />
              <p className="text-[12px] text-muted-foreground">Read only · Admin managed</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSavedSheetOpen(true)}
          className="relative w-11 h-11 flex items-center justify-center rounded-lg active:bg-muted transition-colors flex-shrink-0"
          aria-label="Saved posts"
        >
          <BookmarkSimple
            size={20}
            weight={savedPosts.length > 0 ? 'fill' : 'bold'}
            className={savedPosts.length > 0 ? 'text-primary' : 'text-muted-foreground'}
          />
          {savedPosts.length > 0 && (
            <span className="absolute right-2 top-2 h-4 min-w-4 rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
              {savedPosts.length}
            </span>
          )}
        </button>
      </div>

      {/* Feed — grouped by date, oldest top, newest bottom */}
      <div ref={feedRef} className="flex-1 overflow-y-auto px-3 pt-2 pb-4 flex flex-col">
        {chronologicalPosts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-tint flex items-center justify-center">
              <PaperPlaneTilt size={24} weight="fill" className="text-primary" />
            </div>
            <p className="text-[15px] font-medium text-foreground mt-1">No messages yet</p>
            {!ch.readOnly ? (
              <p className="text-[13px] text-muted-foreground text-center px-8">
                Start the conversation — tap + to create a post
              </p>
            ) : (
              <p className="text-[13px] text-muted-foreground text-center px-8">
                Admin announcements will appear here
              </p>
            )}
          </div>
        ) : (
          <>
            {priorityDateGroups.length > 0 && renderFeedGroups(priorityDateGroups)}

            {priorityDateGroups.length > 0 && regularDateGroups.length > 0 && (
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-border/80" />
                <span className="text-[13px] font-bold text-muted-foreground">Other updates</span>
                <div className="flex-1 h-px bg-border/80" />
              </div>
            )}

            {renderFeedGroups(regularDateGroups)}
          </>
        )}
      </div>

      {/* FAB */}
      {!ch.readOnly && (
        <button
          onClick={() => setSheetOpen(true)}
          className="absolute bottom-6 right-4 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform z-30 bg-primary shadow-lg"
          aria-label="New post"
        >
          <Plus size={24} weight="bold" color="white" />
        </button>
      )}

      <BottomSheet
        isOpen={savedSheetOpen}
        onClose={() => setSavedSheetOpen(false)}
        title="Saved posts"
        subtitle={ch.name}
        floatingCloseButton
      >
        <div className="px-4 pt-4 pb-4">
          {savedPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center">
              <BookmarkSimple size={24} weight="bold" className="mx-auto text-muted-foreground" />
              <p className="mt-3 text-[15px] font-semibold text-foreground">No saved posts yet</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Saved class posts will appear here for quick reference.
              </p>
            </div>
          ) : (
            <ul className="list-none divide-y divide-border">
              {savedPosts.map(post => {
                const tag = getPostTag(post)

                return (
                  <li key={post.id} className="py-3">
                    <div className="flex items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-foreground">
                        {post.title || post.content}
                      </p>
                      <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tag.className}`}>
                        {tag.label}
                      </span>
                    </div>
                    {post.subtitle && (
                      <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
                        {post.subtitle}
                      </p>
                    )}
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {formatDateLabel(post.date)}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </BottomSheet>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={resetSheet}
        title={sheetTitle}
        subtitle={step === 'assignment' ? ch.name : undefined}
        floatingCloseButton
      >
        {step === 'choose' && (
          <div className="px-4 pt-4 flex flex-col gap-3">
            <button
              onClick={() => {
                setPostKind('circular')
                setStep('post')
              }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card active:bg-muted transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-full bg-brand-tint flex items-center justify-center flex-shrink-0">
                <MegaphoneSimple size={20} weight="fill" className="text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Circulars</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Send a class update with homework, priority, or event marking</p>
              </div>
            </button>
            <button
              onClick={() => setStep('assignment')}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card active:bg-muted transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-full bg-brand-tint flex items-center justify-center flex-shrink-0">
                <ClipboardText size={20} weight="fill" className="text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Assignment</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Create and assign work with a due date</p>
              </div>
            </button>
            <button
              onClick={() => setStep('poll')}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card active:bg-muted transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-full bg-brand-tint flex items-center justify-center flex-shrink-0">
                <ChartBar size={20} weight="fill" className="text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Poll</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Ask students to vote before a deadline</p>
              </div>
            </button>
            <button
              onClick={() => {
                setPostKind('diary')
                setStep('post')
              }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card active:bg-muted transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-full bg-brand-tint flex items-center justify-center flex-shrink-0">
                <Sparkle size={20} weight="fill" className="text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">E-diary</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Create a diary note for a class or a selected student</p>
              </div>
            </button>
          </div>
        )}

        {step === 'post' && (
          <div className="px-4 pt-4 flex flex-col gap-4">
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                Class <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <select
                  value={postTargetClassId}
                  onChange={e => setPostTargetClassId(e.target.value)}
                  className="h-12 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-10 text-[15px] font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.displayName}
                    </option>
                  ))}
                </select>
                <CaretDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {postKind === 'diary' && (
              <div>
                <label className="text-[13px] font-medium text-foreground mb-1.5 block">
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
                  <CaretDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                placeholder={postKind === 'diary' ? 'e.g. Homework for tomorrow' : "e.g. Tomorrow's class timing is updated"}
                className="h-12 rounded-lg text-[15px] border-border"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                {postKind === 'diary' ? 'Diary note' : 'Message'} <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                value={postSubtitle}
                onChange={e => setPostSubtitle(e.target.value)}
                placeholder={postKind === 'diary' ? 'Add reminders, notebook notes, or student-specific details…' : 'Add the main circular, reminder, or instruction…'}
                rows={3}
                className="rounded-lg text-[15px] border-border resize-none"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">
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
              <label className="text-[13px] font-medium text-foreground mb-2 block">
                Mark as
              </label>
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

            <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-medium text-foreground">Add poll</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">Let students vote on this post</p>
                </div>
                <Switch checked={postPollEnabled} onCheckedChange={setPostPollEnabled} aria-label="Add poll" />
              </div>

              {postPollEnabled && (
                <div className="flex flex-col gap-3">
                  {pollOptions.map((option, index) => (
                    <div key={index}>
                      <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                        Poll option {index + 1} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={option}
                        onChange={e => {
                          const next = [...pollOptions]
                          next[index] = e.target.value
                          setPollOptions(next)
                        }}
                        placeholder={index === 0 ? 'e.g. Functions' : 'e.g. Recursion'}
                        className="h-12 rounded-lg text-[15px] border-border"
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
                  <div>
                    <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                      Voting deadline <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="datetime-local"
                      value={pollDeadline}
                      onChange={e => setPollDeadline(e.target.value)}
                      className="h-12 rounded-lg text-[15px] border-border"
                    />
                  </div>
                </div>
              )}
            </div>
            <Button
              className="w-full h-12 text-[15px] font-semibold rounded-lg"
              onClick={handlePostSubmit}
              disabled={!postTitle.trim() || (postPollEnabled && (pollOptions.filter(option => option.trim()).length < 2 || !pollDeadline))}
            >
              Send
            </Button>
          </div>
        )}

        {step === 'poll' && (
          <div className="px-4 pt-4 flex flex-col gap-4">
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                Poll question <span className="text-destructive">*</span>
              </label>
              <Input
                value={pollQuestion}
                onChange={e => setPollQuestion(e.target.value)}
                placeholder="e.g. Which topic should we revise first?"
                className="h-12 rounded-lg text-[15px] border-border"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-3">
              {pollOptions.map((option, index) => (
                <div key={index}>
                  <label className="text-[13px] font-medium text-foreground mb-1.5 block">
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
                    className="h-12 rounded-lg text-[15px] border-border"
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
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                Voting deadline <span className="text-destructive">*</span>
              </label>
              <Input
                type="datetime-local"
                value={pollDeadline}
                onChange={e => setPollDeadline(e.target.value)}
                className="h-12 rounded-lg text-[15px] border-border"
              />
            </div>

            <Button
              className="w-full h-12 text-[15px] font-semibold rounded-lg"
              onClick={handlePollSubmit}
              disabled={!pollQuestion.trim() || pollOptions.filter(option => option.trim()).length < 2 || !pollDeadline}
            >
              Post Poll
            </Button>
          </div>
        )}

        {step === 'assignment' && (
          <AssignmentForm onSubmit={handleAssignmentSubmit} showDescription={true} showAttach={true} />
        )}
      </BottomSheet>
    </div>
  )
}

function MessageRow({ post, isSaved, onSaveToggle, onUpdatePost }) {
  const { currentUser } = useApp()
  const [replyingTo, setReplyingTo] = useState(null)
  const [resolvedDoubtIds, setResolvedDoubtIds] = useState([])
  const [teacherReplies, setTeacherReplies] = useState({})
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(post.title || post.content || '')
  const [editSubtitle, setEditSubtitle] = useState(post.subtitle || '')
  const [commentText, setCommentText] = useState('')
  const [teacherComments, setTeacherComments] = useState([])
  const [reactionCount, setReactionCount] = useState(post.reactions || 0)
  const [hasReacted, setHasReacted] = useState(false)
  const commentInputRef = useRef(null)
  const isAssignment = post.type === 'assignment'
  const isPoll = post.type === 'poll'
  const isReschedule = post.type === 'reschedule'
  const isCircular = post.type === 'circular' || post.type === 'announcement'
  const isDiary = post.type === 'diary'
  const postTag = getPostTag(post)
  const attachment = getAttachmentDetails(post)
  const avatarDate = getAvatarDateParts(post.date)
  const dueLabel = formatDueDate(post.dueDate)
  const totalVotes = post.pollOptions?.reduce((sum, option) => sum + option.votes, 0) || 0
  const doubts = (post.doubts || []).map(doubt => ({
    ...doubt,
    status: resolvedDoubtIds.includes(doubt.id) ? 'resolved' : doubt.status,
    teacherReply: teacherReplies[doubt.id] || doubt.teacherReply,
  }))
  const allComments = [
    ...doubts,
    ...teacherComments.map(comment => ({
      ...comment,
      status: 'teacher-note',
      student: 'You',
    })),
  ]
  const pendingDoubts = doubts.filter(doubt => doubt.status !== 'resolved').length
  const resolvedDoubts = doubts.length - pendingDoubts
  const showDoubtsPanel = !isReschedule

  const focusReplyComposer = (doubtId) => {
    setReplyingTo(doubtId)
    setCommentText('')
    window.setTimeout(() => {
      commentInputRef.current?.focus()
      commentInputRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }, 0)
  }

  const handleReply = (doubtId) => {
    if (!commentText.trim()) return
    setTeacherReplies(prev => ({ ...prev, [doubtId]: commentText.trim() }))
    setResolvedDoubtIds(prev => prev.includes(doubtId) ? prev : [...prev, doubtId])
    setCommentText('')
    setReplyingTo(null)
    showToast('Doubt resolved')
  }

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return
    if (replyingTo) {
      handleReply(replyingTo)
      return
    }
    setTeacherComments(prev => [
      ...prev,
      {
        id: `teacher-comment-${Date.now()}`,
        text: commentText.trim(),
        time: 'Just now',
      },
    ])
    setCommentText('')
    showToast('Added to post comments')
  }

  const handleReactionToggle = () => {
    setReactionCount(prev => hasReacted ? Math.max(0, prev - 1) : prev + 1)
    setHasReacted(prev => !prev)
  }

  const handleEditSave = () => {
    if (!editTitle.trim()) return
    onUpdatePost(post.id, {
      title: editTitle.trim(),
      content: editTitle.trim(),
      subtitle: editSubtitle.trim(),
    })
    showToast('Post updated')
    setEditOpen(false)
  }

  useEffect(() => {
    if (!replyingTo) return

    const focusTimer = window.setTimeout(() => {
      commentInputRef.current?.focus()
      commentInputRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }, 0)

    return () => window.clearTimeout(focusTimer)
  }, [replyingTo])

  useEffect(() => {
    if (!commentsOpen) return

    const focusTimer = window.setTimeout(() => {
      commentInputRef.current?.focus()
    }, 150)

    return () => window.clearTimeout(focusTimer)
  }, [commentsOpen])

  return (
    <>
      <div className="flex gap-3 px-1 py-2 transition-colors">
        <Avatar className="h-11 w-11 flex-shrink-0 rounded-xl">
          <AvatarFallback
            className="flex h-full w-full flex-col items-center justify-center rounded-xl leading-none"
            style={avatarAccentStyle}
          >
            <span className="text-[13px] font-bold text-current">{avatarDate.day}</span>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-current/80">
              {avatarDate.month}
            </span>
          </AvatarFallback>
        </Avatar>

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
            <span className={`ml-auto inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${postTag.className}`}>
              {postTag.label}
            </span>
          </div>

        {/* Message body */}
        {isAssignment ? (
          <div className="mt-1">
            <p className="text-sm font-semibold text-foreground">{post.title || post.content}</p>
            {post.subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{post.subtitle}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <p className="text-[12px] text-muted-foreground">{dueLabel}</p>
            </div>
          </div>
        ) : isPoll ? (
          <div className="mt-1">
            <p className="text-sm font-semibold text-foreground">{post.title || post.content}</p>
            <div className="flex flex-col gap-2 mt-3">
              {post.pollOptions?.map(option => {
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0

                return (
                  <button
                    key={option.id}
                    className="relative overflow-hidden rounded-lg border border-border bg-card px-3 py-2 text-left active:scale-[0.99] transition-transform"
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-brand-tint"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex items-center justify-between gap-3">
                      <span className="text-[13px] font-medium text-foreground">{option.label}</span>
                      <span className="text-[12px] font-semibold text-primary">{percentage}%</span>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-[12px] text-muted-foreground">{totalVotes} votes</p>
              <Badge className="text-[10px] font-medium bg-card text-muted-foreground border border-border">
                Voting ends {post.pollDeadline ? new Date(post.pollDeadline).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'TBD'}
              </Badge>
            </div>
          </div>
        ) : isCircular ? (
          <div className="mt-1">
            <p className="text-sm font-semibold text-foreground">{post.title || post.content}</p>
            {post.subtitle && (
              <p className="text-sm leading-relaxed mt-1 text-foreground/80">{post.subtitle}</p>
            )}
            {attachment.isImage && attachment.previewUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
                <img src={attachment.previewUrl} alt={attachment.name || post.title || 'Attachment'} className="h-44 w-full object-cover" />
              </div>
            )}
          </div>
        ) : isDiary ? (
          <div className="mt-1">
            <p className={`${post.targetStudentName ? 'mt-1' : 'mt-1.5'} text-sm font-semibold text-foreground`}>
              {post.title || post.content}
            </p>
            {post.subtitle && (
              <p className="text-sm leading-relaxed mt-1 text-foreground/80">{post.subtitle}</p>
            )}
            {attachment.isImage && attachment.previewUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
                <img src={attachment.previewUrl} alt={attachment.name || post.title || 'Attachment'} className="h-44 w-full object-cover" />
              </div>
            )}
          </div>
        ) : isReschedule ? (
          <div className="mt-1">
            <p className="text-sm font-semibold text-foreground">{post.title || post.content}</p>
            {post.subtitle && (
              <p className="text-sm text-amber-900/80 leading-relaxed mt-1">{post.subtitle}</p>
            )}
            <p className="text-[12px] text-muted-foreground mt-2">Students will see this update in their class feed.</p>
          </div>
        ) : (
          <div className="mt-0.5">
            <p className="text-sm font-semibold text-foreground leading-snug">
              {post.title || post.content}
            </p>
            {post.subtitle && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                {post.subtitle}
              </p>
            )}
          </div>
        )}

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              {reactionCount > 0 && (
                <button
                  type="button"
                  onClick={handleReactionToggle}
                  className={`min-h-8 px-3 rounded-full text-[12px] font-semibold transition-colors ${
                    hasReacted
                      ? 'bg-brand-tint text-primary'
                      : 'bg-muted text-muted-foreground active:bg-accent'
                  }`}
                >
                  👍 {reactionCount}
                </button>
              )}
              {showDoubtsPanel && (
                <button
                  type="button"
                  onClick={() => setCommentsOpen(true)}
                  className="min-h-8 inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground active:text-primary"
                >
                  <ChatCircle size={16} weight="bold" />
                  {allComments.length > 0 ? `View ${allComments.length} comment${allComments.length !== 1 ? 's' : ''}` : 'Add a comment'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="min-h-8 inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground active:text-primary"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onSaveToggle(post)}
                className={`min-h-8 inline-flex items-center gap-1.5 text-[12px] font-semibold ${
                  isSaved ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <BookmarkSimple size={16} weight={isSaved ? 'fill' : 'bold'} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          {isSaved && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge className="bg-brand-tint text-primary border-none text-[10px]">
                Saved to study diary
              </Badge>
            </div>
          )}
        </div>
      </div>

      <BottomSheet isOpen={commentsOpen} onClose={() => setCommentsOpen(false)} title="Comments">
        <div className="px-4 pt-4 pb-3 flex flex-col gap-4">
          <div className="rounded-xl bg-muted p-3">
            <p className="text-[12px] font-semibold text-muted-foreground">Post</p>
            <p className="text-[14px] font-semibold text-foreground mt-1">{post.title || post.content}</p>
            {post.subtitle && (
              <p className="text-[13px] text-muted-foreground mt-1">{post.subtitle}</p>
            )}
          </div>
          {allComments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center">
              <p className="text-[14px] font-semibold text-foreground">No comments yet</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                Student doubts and teacher diary notes will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {allComments.map(doubt => {
                  const isResolved = doubt.status === 'resolved'
                  const isTeacherNote = doubt.status === 'teacher-note'
                  const isReplying = replyingTo === doubt.id

                  return (
                    <div key={doubt.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="text-[11px] font-bold" style={isTeacherNote ? avatarAccentStyle : undefined}>
                          {doubt.student?.[0] || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-bold text-foreground">{doubt.student}</p>
                          <span className="text-[12px] text-muted-foreground">{doubt.time || '1d'}</span>
                          {isTeacherNote && (
                            <Badge className="bg-brand-tint text-primary border-none text-[10px]">Diary note</Badge>
                          )}
                        </div>
                        <p className="text-[14px] text-foreground leading-relaxed mt-0.5">{doubt.text}</p>

                        {!isTeacherNote && (
                          <div className="mt-1.5 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => focusReplyComposer(doubt.id)}
                              className="text-[12px] font-semibold text-primary active:opacity-70"
                            >
                              Reply
                            </button>
                          </div>
                        )}

                        {doubt.teacherReply && (
                          <div className="mt-2 ml-3 border-l border-border pl-3">
                            <p className="text-[12px] font-semibold text-primary">
                              {currentUser?.name || 'Teacher'}
                            </p>
                            <p className="text-[13px] text-foreground mt-0.5">{doubt.teacherReply}</p>
                          </div>
                        )}

                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="text-[11px] font-bold" style={avatarAccentStyle}>
                T
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 rounded-full border border-border bg-card pl-4 pr-1 py-1.5 flex items-center gap-2">
              <input
                ref={commentInputRef}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder={replyingTo ? 'Reply to resolve this doubt...' : 'Add a teacher note or reply...'}
                className="flex-1 min-w-0 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={handleCommentSubmit}
                disabled={!commentText.trim()}
                className="w-8 h-8 rounded-full bg-primary disabled:bg-muted flex items-center justify-center transition-colors"
                aria-label="Send comment"
              >
                <PaperPlaneRight size={15} weight="fill" color={commentText.trim() ? 'white' : 'var(--color-muted-foreground)'} />
              </button>
            </div>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit post">
        <div className="px-4 pt-4 pb-4 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-foreground">Title</label>
            <Input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="h-12 rounded-lg text-[15px] border-border"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-foreground">
              Message <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              value={editSubtitle}
              onChange={e => setEditSubtitle(e.target.value)}
              rows={3}
              className="rounded-lg text-[15px] border-border resize-none"
            />
          </div>
          <Button
            className="w-full h-12 rounded-lg text-[15px] font-semibold"
            onClick={handleEditSave}
            disabled={!editTitle.trim()}
          >
            Save changes
          </Button>
        </div>
      </BottomSheet>
    </>
  )
}
