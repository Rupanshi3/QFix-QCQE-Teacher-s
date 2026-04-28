import { useMemo, useState } from 'react'
import { ArrowLeft, CaretDown } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { showToast } from '../components/Toast'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TIME_SLOTS = [
  { id: 'slot-1', label: '8:00 AM - 9:00 AM', type: 'class' },
  { id: 'slot-2', label: '9:00 AM - 10:00 AM', type: 'class' },
  { id: 'slot-3', label: '10:00 AM - 11:00 AM', type: 'class' },
  { id: 'slot-4', label: '11:00 AM - 12:00 PM', type: 'class' },
  { id: 'lunch', label: '12:00 PM - 1:00 PM', type: 'lunch' },
  { id: 'slot-5', label: '1:00 PM - 2:00 PM', type: 'class' },
  { id: 'slot-6', label: '2:00 PM - 3:00 PM', type: 'class' },
  { id: 'slot-7', label: '3:00 PM - 4:00 PM', type: 'class' },
]

function buildInitialTimetable(subjectOptions) {
  return DAYS.reduce((acc, day) => {
    acc[day] = TIME_SLOTS.reduce((slotAcc, slot, index) => {
      if (slot.type === 'lunch') {
        slotAcc[slot.id] = 'Lunch Break'
      } else {
        slotAcc[slot.id] = subjectOptions[index % subjectOptions.length] || ''
      }
      return slotAcc
    }, {})
    return acc
  }, {})
}

export default function TimetableBuilder() {
  const navigate = useNavigate()
  const { getClasses } = useApp()
  const classes = getClasses()
  const subjectOptions = useMemo(
    () => Array.from(new Set(classes.map((cls) => cls.subject).filter(Boolean))),
    [classes]
  )
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '')
  const [selectedDay, setSelectedDay] = useState('Mon')
  const [timetable, setTimetable] = useState(() => buildInitialTimetable(subjectOptions))

  const selectedClass = classes.find((cls) => cls.id === selectedClassId)

  const updateSlot = (day, slotId, value) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slotId]: value,
      },
    }))
  }

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="bg-card border-b border-border px-4 pt-3 pb-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} color="var(--color-foreground)" weight="bold" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[18px] font-semibold text-foreground">Create timetable</h1>
          <p className="text-[13px] text-muted-foreground">Set the weekly structure for a class</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <label className="mb-1.5 block text-[13px] font-medium text-foreground">Select class</label>
          <div className="relative">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-border bg-card px-3 pr-10 text-[14px] text-foreground outline-none"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.displayName || cls.subject}
                </option>
              ))}
            </select>
            <CaretDown
              size={16}
              weight="bold"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`h-10 shrink-0 rounded-full border px-4 text-[13px] font-medium ${
                  selectedDay === day
                    ? 'border-primary bg-brand-tint text-primary'
                    : 'border-border bg-background text-foreground'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-border bg-background">
            <div className="border-b border-border px-4 py-3">
              <p className="text-[15px] font-semibold text-foreground">{selectedDay}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {selectedClass?.displayName || selectedClass?.subject || 'Selected class'}
              </p>
            </div>

            <div className="divide-y divide-border">
              {TIME_SLOTS.map((slot) => (
                <div key={slot.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground">{slot.label}</p>
                      {slot.type === 'lunch' && (
                        <p className="mt-0.5 text-[12px] text-muted-foreground">Fixed break</p>
                      )}
                    </div>

                    {slot.type === 'lunch' ? (
                      <span className="shrink-0 rounded-full bg-brand-tint px-3 py-1 text-[12px] font-semibold text-primary">
                        Lunch Break
                      </span>
                    ) : (
                      <div className="relative w-[168px] shrink-0">
                        <select
                          value={timetable[selectedDay]?.[slot.id] || ''}
                          onChange={(e) => updateSlot(selectedDay, slot.id, e.target.value)}
                          className="h-10 w-full appearance-none rounded-lg border border-border bg-card px-3 pr-9 text-[13px] text-foreground outline-none"
                        >
                          <option value="">Select subject</option>
                          {subjectOptions.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                        <CaretDown
                          size={15}
                          weight="bold"
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => showToast(`Timetable updated for ${selectedClass?.displayName || selectedClass?.subject || 'this class'}`)}
            className="mt-4 h-11 w-full rounded-lg bg-primary text-[14px] font-semibold text-white active:opacity-90"
          >
            Save timetable
          </button>
        </div>
      </div>
    </div>
  )
}
