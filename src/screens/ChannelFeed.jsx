import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CaretLeft, PaperPlaneTilt, ClipboardText, Paperclip, Lock } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { formatDueDate } from '../lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function ChannelFeed() {
  const { channelId } = useParams()
  const navigate = useNavigate()
  const { getChannel, addPost, markChannelRead } = useApp()
  const ch = getChannel(channelId)

  const [message, setMessage] = useState('')
  const feedRef = useRef(null)
  const inputRef = useRef(null)

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

  const handleSend = () => {
    if (!message.trim()) return
    addPost(channelId, message.trim())
    setMessage('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Reverse posts so oldest is at top, newest at bottom (chat convention)
  const chronologicalPosts = [...ch.posts].reverse()

  return (
    <div className="h-full flex flex-col bg-stone-50">
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

      {/* Feed — reversed for chat order (oldest top, newest bottom) */}
      <ul ref={feedRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-4 flex flex-col gap-3 list-none">
        {chronologicalPosts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-tint flex items-center justify-center">
              <PaperPlaneTilt size={24} weight="fill" className="text-primary" />
            </div>
            <p className="text-[15px] font-medium text-foreground mt-1">No messages yet</p>
            {!ch.readOnly ? (
              <p className="text-[13px] text-muted-foreground text-center px-8">
                Start the conversation — type a message below
              </p>
            ) : (
              <p className="text-[13px] text-muted-foreground text-center px-8">
                Admin announcements will appear here
              </p>
            )}
          </div>
        ) : (
          chronologicalPosts.map(post => <li key={post.id}><PostCard post={post} /></li>)
        )}
      </ul>

      {/* Inline message composer */}
      {!ch.readOnly && (
        <div className="bg-card border-t border-border px-3 py-2.5 flex items-end gap-2 flex-shrink-0">
          <button
            className="w-11 h-11 flex items-center justify-center rounded-lg text-muted-foreground active:bg-muted transition-colors flex-shrink-0"
            aria-label="Attach file"
          >
            <Paperclip size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <label htmlFor="channel-message" className="sr-only">Message</label>
            <textarea
              id="channel-message"
              ref={inputRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              className="w-full resize-none rounded-xl border border-border bg-stone-50 px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors max-h-[120px]"
              style={{ minHeight: '40px' }}
              onInput={e => {
                e.target.style.height = '40px'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-30 bg-primary"
            aria-label="Send message"
          >
            <PaperPlaneTilt size={18} weight="fill" color="white" />
          </button>
        </div>
      )}
    </div>
  )
}

function PostCard({ post }) {
  const isAssignment = post.type === 'assignment'
  const dueLabel = formatDueDate(post.dueDate)

  return (
    <div className="bg-card border border-border rounded-xl p-3.5">
      {/* Author row */}
      <div className="flex items-center gap-2 mb-2.5">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="text-[12px] font-bold bg-brand-tint text-primary">
            {post.authorInitial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground leading-tight">{post.author}</p>
          <p className="text-[11px] text-muted-foreground leading-tight">{post.time}</p>
        </div>
        {isAssignment && (
          <Badge className="text-[11px] font-semibold flex items-center gap-1 flex-shrink-0 bg-brand-tint text-primary border-none">
            <ClipboardText size={10} weight="fill" />
            Assignment
          </Badge>
        )}
      </div>

      {/* Content */}
      {isAssignment ? (
        <div className="bg-muted rounded-lg p-3">
          <p className="text-[15px] font-semibold text-foreground">{post.content}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[13px] text-muted-foreground">{dueLabel}</p>
            <Badge className="text-[11px] font-medium bg-brand-tint text-primary border-none">
              {post.submitted}/{post.total} submitted
            </Badge>
          </div>
        </div>
      ) : (
        <p className="text-[15px] text-foreground leading-relaxed">{post.content}</p>
      )}

      {/* Reactions */}
      {post.reactions > 0 && (
        <div className="flex items-center justify-end mt-2.5">
          <span className="text-[12px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            👍 {post.reactions}
          </span>
        </div>
      )}
    </div>
  )
}
