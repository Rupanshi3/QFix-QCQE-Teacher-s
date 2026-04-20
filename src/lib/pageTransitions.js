import { useLocation, useNavigate } from 'react-router-dom'

function getDefaultDepth(pathname) {
  if (
    pathname === '/' ||
    pathname === '/home' ||
    pathname === '/communication' ||
    pathname === '/my-classes' ||
    pathname === '/assignments' ||
    pathname === '/profile'
  ) {
    return 0
  }

  if (pathname.startsWith('/workspace/')) return 1
  if (pathname.startsWith('/attendance/')) return 2
  if (pathname.startsWith('/students/')) return 2
  if (pathname.startsWith('/channel/')) return 1
  if (pathname.startsWith('/assignment/')) return 1

  return 0
}

export function getLocationDepth(location) {
  return location.state?.navDepth ?? getDefaultDepth(location.pathname)
}

function isModifiedEvent(event) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
}

export function useChildLinkProps() {
  const location = useLocation()
  const nextDepth = getLocationDepth(location) + 1

  return (to, options = {}) => {
    const { onClick, state, ...rest } = options

    return {
      to,
      state: { ...state, navDepth: nextDepth },
      onClick: (event) => {
        onClick?.(event)

        if (event.defaultPrevented || event.button !== 0 || isModifiedEvent(event)) {
          return
        }
      },
      ...rest,
    }
  }
}

export function useChildNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const nextDepth = getLocationDepth(location) + 1

  return (to, options = {}) => {
    navigate(to, {
      ...options,
      state: { ...(options.state || {}), navDepth: nextDepth },
    })
  }
}
