import { useEffect } from 'react'
import { toast as sonnerToast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

export { Toaster }

export function showToast(message) {
  sonnerToast(message, {
    duration: 2500,
    style: {
      background: '#1c1917',
      color: 'white',
      borderRadius: '12px',
      fontSize: '14px',
      padding: '12px 16px',
      border: 'none',
    },
  })
}

// Legacy component for compatibility
export default function Toast({ message, isVisible, onDismiss }) {
  useEffect(() => {
    if (isVisible) {
      showToast(message)
      const t = setTimeout(onDismiss, 2500)
      return () => clearTimeout(t)
    }
  }, [isVisible, message, onDismiss])
  return null
}
