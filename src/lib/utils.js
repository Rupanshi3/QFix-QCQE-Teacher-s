import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function formatDueDate(dueDate) {
  return dueDate === 'TBD' ? 'No due date' : `Due ${dueDate}`
}

export function formatDateLabel(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  const months = ['January','February','March','April','May','June',
    'July','August','September','October','November','December']
  const suffix = (d === 1 || d === 21 || d === 31) ? 'st'
    : (d === 2 || d === 22) ? 'nd'
    : (d === 3 || d === 23) ? 'rd' : 'th'
  return `${months[m - 1]} ${d}${suffix}`
}
