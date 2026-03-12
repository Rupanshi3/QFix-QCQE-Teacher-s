import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass, MegaphoneSimple } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../components/ui/input-group'
import BottomNav from '../components/BottomNav'

export default function Communication() {
  const { getChannelOrder, getChannel, getClassById } = useApp()
  const channelOrder = getChannelOrder()
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const renderChannelList = (filtered) => (
    <ul className="flex flex-col list-none">
      {channelOrder.map((channelId) => {
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

        return (
          <li key={channelId}><Link
            to={`/channel/${channelId}`}
            className="block px-4 py-3 flex items-start gap-3 active:bg-muted/50 transition-colors"
          >
            {/* Channel avatar */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isBroadcast ? 'bg-warning-muted' : !classColor ? 'bg-brand-tint' : ''}`}
              style={!isBroadcast && classColor ? { backgroundColor: classColor + '1A' } : undefined}
            >
              {isBroadcast
                ? <MegaphoneSimple size={20} weight="fill" color="var(--color-warning)" />
                : <span className="text-[14px] font-bold" style={classColor ? { color: classColor } : undefined}>{avatarLetter}</span>
              }
            </div>

            {/* Channel info */}
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
          </Link></li>
        )
      })}
    </ul>
  )

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="bg-card p-4 flex items-center justify-between flex-shrink-0">
        <h1 className="text-[22px] font-semibold text-foreground">Communication</h1>
      </div>

      {isSearching ? (
        <>
          <div className="px-4 pb-3 flex items-center gap-2">
            <InputGroup className="flex-1 rounded-lg bg-muted h-auto">
              <InputGroupAddon align="inline-start">
                <MagnifyingGlass size={16} />
              </InputGroupAddon>
              <InputGroupInput
                id="search-channels"
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for a class, group, community..."
                className="text-[16px] py-2.5 h-auto"
              />
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
          <div className="px-4 pb-3">
            <InputGroup
              className="rounded-lg bg-muted h-auto cursor-pointer"
              onClick={() => setIsSearching(true)}
            >
              <InputGroupAddon align="inline-start">
                <MagnifyingGlass size={16} />
              </InputGroupAddon>
              <span className="flex-1 text-[16px] text-muted-foreground py-2.5">Search for a class, group, community...</span>
            </InputGroup>
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
