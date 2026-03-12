import { useNavigate, useLocation } from 'react-router-dom'
import {
  CalendarBlank, ChatCircle, Books, ClipboardText, User,
} from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'

const schoolTabs = [
  { path: '/home',          label: 'Home',        Icon: CalendarBlank },
  { path: '/communication', label: 'Chat',         Icon: ChatCircle },
  { path: '/profile',       label: 'Profile',      Icon: User },
]

const collegeTabs = [
  { path: '/home',          label: 'Home',        Icon: CalendarBlank },
  { path: '/communication', label: 'Chat',         Icon: ChatCircle },
  { path: '/my-classes',    label: 'My Classes',   Icon: Books },
  { path: '/assignments',   label: 'Assignments',  Icon: ClipboardText },
  { path: '/profile',       label: 'Profile',      Icon: User },
]

export default function BottomNav() {
  const { currentUser, getChannelOrder, getChannel } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = currentUser?.role === 'college' ? collegeTabs : schoolTabs

  const totalUnread = getChannelOrder().reduce((sum, id) => sum + (getChannel(id)?.unread || 0), 0)

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around z-40 py-4">
      {tabs.map(({ path, label, Icon }) => {
        const isActive = location.pathname === path ||
          (path === '/communication' && location.pathname.startsWith('/channel'))
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 active:opacity-70 transition-opacity"
            aria-label={label}
          >
            <div className="relative">
              <Icon
                size={22}
                weight={isActive ? 'duotone' : 'regular'}
                color={isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)'}
              />
              {path === '/communication' && totalUnread > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
