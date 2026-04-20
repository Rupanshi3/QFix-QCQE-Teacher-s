import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CaretLeft, PaperPlaneTilt, ClipboardText, ChartBar, Plus, Lock,
  ChatCircle, ChatCircleDots, BookmarkSimple, PaperPlaneRight,
} from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { formatDueDate, formatDateLabel } from '../lib/utils'
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

const avatarAccentStyle = {
  backgroundColor: 'var(--color-avatar-accent)',
  color: 'var(--color-avatar-accent-foreground)',
}

export default function ChannelFeed() {
  const { channelId } = useParams()
  const navigate = useNavigate()
  const { getChannel, addPost, addAssignment, markChannelRead } = useApp()
  const ch = getChannel(channelId)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [step, setStep] = useState('choose') // 'choose' | 'post' | 'poll' | 'assignment'
  const [postTitle, setPostTitle] = useState('')
  const [postSubtitle, setPostSubtitle] = useState('')
  const [postPollEnabled, setPostPollEnabled] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [pollDeadline, setPollDeadline] = useState('')
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
    setPostTitle('')
    setPostSubtitle('')
    setPostPollEnabled(false)
    setPollQuestion('')
    setPollOptions(['', ''])
    setPollDeadline('')
  }

  const handlePostSubmit = () => {
    if (!postTitle.trim()) return
    const options = pollOptions.map(option => option.trim()).filter(Boolean)
    if (postPollEnabled && (options.length < 2 || !pollDeadline)) return

    addPost(
      channelId,
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
        : {}
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

  const sheetTitle = step === 'choose'
    ? 'Create New'
    : step === 'post'
    ? 'New Post'
    : step === 'poll'
    ? 'New Poll'
    : 'New Assignment'

  // Reverse posts so oldest is at top, newest at bottom (chat convention)
  const chronologicalPosts = [...ch.posts].reverse()
  const dateGroups = groupPostsByDate(chronologicalPosts)

  return (
    <div className="h-full flex flex-col bg-stone-50 relative">
      {/* Header */}
      <div className="bg-card border-b border-border px-3 pt-3 pb-3 flex items-center gap-2.5 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-muted transition-colors flex-shrink-0"
          aria-label="Go back"
        >
          <CaretLeft size={20} color="var(--color-foreground)" weight="bold" />
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
          dateGroups.map(group => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Messages in this date group */}
              <div className="flex flex-col">
                {group.posts.map((post, index) => (
                  <div key={post.id}>
                    <MessageRow post={post} />
                    {index < group.posts.length - 1 && (
                      <div className="my-4 h-px bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
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
              onClick={() => setStep('post')}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card active:bg-muted transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-full bg-brand-tint flex items-center justify-center flex-shrink-0">
                <PaperPlaneTilt size={20} weight="fill" className="text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Post</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Share an update with the class</p>
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
          </div>
        )}

        {step === 'post' && (
          <div className="px-4 pt-4 flex flex-col gap-4">
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                placeholder="e.g. Tomorrow's class is cancelled"
                className="h-12 rounded-lg text-[15px] border-border"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-foreground mb-1.5 block">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                value={postSubtitle}
                onChange={e => setPostSubtitle(e.target.value)}
                placeholder="Add more details…"
                rows={3}
                className="rounded-lg text-[15px] border-border resize-none"
              />
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

function MessageRow({ post }) {
  const [replyingTo, setReplyingTo] = useState(null)
  const [resolvedDoubtIds, setResolvedDoubtIds] = useState([])
  const [teacherReplies, setTeacherReplies] = useState({})
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [teacherComments, setTeacherComments] = useState([])
  const [isSaved, setIsSaved] = useState(false)
  const [reactionCount, setReactionCount] = useState(post.reactions || 0)
  const [hasReacted, setHasReacted] = useState(false)
  const commentInputRef = useRef(null)
  const isAssignment = post.type === 'assignment'
  const isPoll = post.type === 'poll'
  const isReschedule = post.type === 'reschedule'
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

  const handleSaveToggle = () => {
    setIsSaved(prev => {
      const next = !prev
      showToast(next ? 'Saved to your study diary' : 'Removed from study diary')
      return next
    })
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
      <div className="flex gap-2.5 px-1 py-1.5 rounded-lg transition-colors">
        {/* Avatar */}
        <Avatar className="w-9 h-9 flex-shrink-0 mt-0.5">
          <AvatarFallback className="text-[12px] font-bold" style={avatarAccentStyle}>
            {post.authorInitial}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author + time inline */}
          <div className="flex items-center gap-2 min-h-6">
            <span className="text-sm font-bold text-foreground leading-tight">
              {post.author}
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight">
              {post.time}
            </span>
          </div>

        {/* Message body */}
        {isAssignment ? (
          <div className="bg-muted rounded-lg p-3 mt-1.5">
            <p className="text-sm font-semibold text-foreground">{post.title || post.content}</p>
            {post.subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{post.subtitle}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <p className="text-[12px] text-muted-foreground">{dueLabel}</p>
              <Badge className="text-[10px] font-medium bg-brand-tint text-primary border-none">
                {post.submitted}/{post.total} submitted
              </Badge>
            </div>
          </div>
        ) : isPoll ? (
          <div className="bg-muted rounded-lg p-3 mt-1.5">
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
        ) : isReschedule ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-1.5">
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
                onClick={handleSaveToggle}
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

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <ChatCircleDots size={15} weight="fill" className="text-primary" />
              <p className="text-[13px] font-semibold text-foreground">Doubts & comments</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              {pendingDoubts > 0 && (
                <Badge className="text-[10px] bg-orange-100 text-orange-800 border-none">
                  {pendingDoubts} pending
                </Badge>
              )}
              {resolvedDoubts > 0 && (
                <Badge className="text-[10px] bg-emerald-100 text-emerald-800 border-none">
                  {resolvedDoubts} resolved
                </Badge>
              )}
            </div>
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
                              className="text-[12px] font-semibold text-muted-foreground active:text-primary"
                            >
                              Reply
                            </button>
                            <Badge className={`text-[10px] border-none ${
                              isResolved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {isResolved ? 'Resolved' : 'Pending'}
                            </Badge>
                          </div>
                        )}

                        {doubt.teacherReply && (
                          <div className="mt-2 ml-3 border-l border-border pl-3">
                            <p className="text-[12px] font-semibold text-primary">Teacher reply</p>
                            <p className="text-[13px] text-foreground mt-0.5">{doubt.teacherReply}</p>
                          </div>
                        )}

                        {!isTeacherNote && !isResolved && !isReplying && (
                          <button
                            type="button"
                            onClick={() => focusReplyComposer(doubt.id)}
                            className="mt-2 h-8 px-3 rounded-lg bg-muted text-[12px] font-semibold text-primary active:bg-background"
                          >
                            Reply
                          </button>
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
    </>
  )
}
