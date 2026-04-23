import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass, MegaphoneSimple } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { useChildLinkProps } from '../lib/pageTransitions'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import BottomNav from '../components/BottomNav'

export default function Communication() {
  const { currentUser, getChannelOrder, getChannel, getClassById } = useApp()
  const channelOrder = getChannelOrder()
  const childLinkProps = useChildLinkProps()
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const isCollege = currentUser?.role === 'college'

  const renderChannelList = (filtered) => {
    const visibleChannels = channelOrder
      .map((channelId) => {
        const ch = getChannel(channelId)
        if (!ch) return null
        const lastPost = ch.posts[0]
        const isBroadcast = ch.id === 'broadcast'
        const hasUnread = (ch.unread || 0) > 0

        const cls = ch.classId ? getClassById(ch.classId) : null
        const classColor = cls?.color || null
        const divisionLabel = cls ? cls.division : ch.name
        if (filtered && !divisionLabel.toLowerCase().includes(search.toLowerCase())) return null
        const avatarLetter = cls
          ? ch.classId?.startsWith('cb-')
            ? cls.division.replace(/.*?(First|Second|Third|Fourth|Fifth).*/, (_, w) =>
                ({ First: 'I', Second: 'II', Third: 'III', Fourth: 'IV', Fifth: 'V' }[w] + ' Y'))
            : cls.division.replace('Class ', '')
          : ch.name.charAt(0)

        return { avatarLetter, ch, classColor, divisionLabel, hasUnread, isBroadcast, lastPost }
      })
      .filter(Boolean)

    const adminChannels = visibleChannels.filter(({ isBroadcast }) => isBroadcast)
    const classChannels = visibleChannels.filter(({ isBroadcast }) => !isBroadcast)

    const renderChannelItem = ({ avatarLetter, ch, classColor, divisionLabel, hasUnread, isBroadcast, lastPost }, index, channels) => (
      <li key={ch.id} className={index < channels.length - 1 ? 'border-b border-border/60' : ''}>
        <Link
          {...childLinkProps(`/channel/${ch.id}`)}
          className="block px-4 py-3 flex items-start gap-3 active:bg-muted/40 transition-colors"
        >
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback
              className="text-[14px] font-bold"
              style={
                isBroadcast
                  ? { backgroundColor: 'var(--color-warning)', color: 'var(--warning-muted)' }
                  : classColor
                    ? { backgroundColor: classColor, color: 'rgba(255,255,255,0.92)' }
                    : { backgroundColor: 'var(--color-avatar-accent)', color: 'var(--color-avatar-accent-foreground)' }
              }
            >
              {isBroadcast ? (
                <MegaphoneSimple size={20} weight="fill" color="currentColor" />
              ) : (
                avatarLetter
              )}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-[16px] font-semibold truncate">{divisionLabel}</p>
              {lastPost && (
                <span className={`text-[12px] flex-shrink-0 ml-2 ${hasUnread ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {lastPost.time}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className={`text-[14px] truncate ${hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {lastPost
                  ? <><span className="text-muted-foreground">{lastPost.author.split(' ')[0]}: </span>{lastPost.content}</>
                  : 'No messages yet'
                }
              </p>
              {hasUnread && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center flex-shrink-0 ml-2">
                  {ch.unread}
                </span>
              )}
            </div>
          </div>
        </Link>
      </li>
    )

    const renderSection = (title, channels) => {
      if (channels.length === 0) return null

      return (
        <section>
          <div className="mb-2 px-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{title}</p>
          </div>
          <ul className="flex flex-col list-none">
            {channels.map((channel, index) => renderChannelItem(channel, index, channels))}
          </ul>
        </section>
      )
    }

    if (visibleChannels.length === 0) {
      return (
        <div className="px-4 py-10 text-center">
          <p className="text-[14px] font-semibold text-foreground">No chats found</p>
          <p className="text-[13px] text-muted-foreground mt-1">Try another class or group name.</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-6">
        {renderSection(isCollege ? 'College administration' : 'Administration', adminChannels)}
        {renderSection(isCollege ? 'College class chats' : 'Class chats', classChannels)}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="bg-card p-4 flex items-center justify-between flex-shrink-0">
        <h1 className="text-[22px] font-semibold text-foreground">Communication</h1>
      </div>

      {isSearching ? (
        <>
          <div className="px-4 pb-3 flex items-center gap-2">
            <InputGroup className="flex-1 h-11 rounded-lg bg-card border-border shadow-none">
              <InputGroupInput
                id="search-channels"
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for a class, group, community..."
                className="text-sm min-w-0"
              />
              <InputGroupAddon>
                <MagnifyingGlass size={16} />
              </InputGroupAddon>
            </InputGroup>
            <button
              onClick={() => { setSearch(''); setIsSearching(false) }}
              className="text-[16px] text-primary font-medium px-1"
            >
              Cancel
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pb-24">
            {search && renderChannelList(true)}
          </div>
        </>
      ) : (
        <>
          <div className="px-4 pb-6">
            <div
              className="flex items-center gap-2 bg-card border border-border rounded-lg h-11 px-3 cursor-pointer"
              onClick={() => setIsSearching(true)}
            >
              <MagnifyingGlass size={16} className="text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-sm text-muted-foreground truncate">Search for a class, group, community...</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pb-24">
            {renderChannelList(false)}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  )
}
