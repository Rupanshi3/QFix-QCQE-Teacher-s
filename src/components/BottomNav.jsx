import { useNavigate, useLocation } from 'react-router-dom'
import {
  CalendarBlank, Books, ClipboardText, User,
} from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'

const schoolTabs = [
  { path: '/home',          label: 'Home',        Icon: CalendarBlank },
  { path: '/my-classes',    label: 'My Classes',   Icon: Books },
  { path: '/assignments',   label: 'Assignments',  Icon: ClipboardText },
  { path: '/profile',       label: 'Profile',      Icon: User },
]

const collegeTabs = [
  { path: '/home',          label: 'Home',        Icon: CalendarBlank },
  { path: '/my-classes',    label: 'My Classes',   Icon: Books },
  { path: '/assignments',   label: 'Assignments',  Icon: ClipboardText },
  { path: '/profile',       label: 'Profile',      Icon: User },
]

export default function BottomNav() {
  const { currentUser } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = currentUser?.role === 'college' ? collegeTabs : schoolTabs

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around z-40 py-4">
      {tabs.map(({ path, label, Icon }) => {
        const isActive = location.pathname === path
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
