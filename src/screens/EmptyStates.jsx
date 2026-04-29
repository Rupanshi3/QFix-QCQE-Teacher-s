import {
  Bell,
  CalendarPlus,
  ChatCircleDots,
  Plus,
  MegaphoneSimple,
  Rows,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'

function IllustrationCard({ icon: Icon, tone = 'blue', title, subtitle, variant = 'generic' }) {
  const tones = {
    blue: {
      shell: 'bg-brand-tint',
      iconBg: 'bg-primary',
      line: 'bg-primary/20',
    },
    green: {
      shell: 'bg-emerald-50',
      iconBg: 'bg-emerald-600',
      line: 'bg-emerald-500/15',
    },
    amber: {
      shell: 'bg-amber-50',
      iconBg: 'bg-amber-600',
      line: 'bg-amber-500/15',
    },
  }

  const palette = tones[tone] || tones.blue

  return (
    <div>
      <div className={`relative overflow-hidden rounded-2xl ${palette.shell} px-4 py-4`}>
        {variant === 'messages' ? (
          <>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${palette.iconBg} text-white`}>
              <MegaphoneSimple size={22} weight="fill" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className={`h-9 w-9 rounded-xl ${palette.iconBg} opacity-85`} />
              <div className="flex-1">
                <div className={`h-2.5 w-24 rounded-full ${palette.line}`} />
                <div className={`mt-2 h-2.5 w-36 rounded-full ${palette.line}`} />
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 h-8 w-8 rounded-lg ${palette.iconBg} opacity-80`} />
                <div className="flex-1">
                  <div className={`h-2.5 w-20 rounded-full ${palette.line}`} />
                  <div className={`mt-2 h-2.5 w-32 rounded-full ${palette.line}`} />
                  <div className={`mt-2 h-2.5 w-24 rounded-full ${palette.line}`} />
                </div>
              </div>
            </div>
          </>
        ) : variant === 'events' ? (
          <>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${palette.iconBg} text-white`}>
              <CalendarPlus size={22} weight="fill" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="rounded-xl border border-white/60 bg-white/70 px-3 py-3">
                  <div className={`h-2.5 w-10 rounded-full ${palette.line}`} />
                  <div className={`mt-2 h-2.5 w-full rounded-full ${palette.line}`} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${palette.iconBg} text-white`}>
              <Icon size={22} weight="fill" />
            </div>
            <div className={`mt-4 h-2.5 w-20 rounded-full ${palette.line}`} />
            <div className={`mt-2 h-2.5 w-32 rounded-full ${palette.line}`} />
            <div className="mt-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 backdrop-blur-sm">
              <div className={`h-2.5 w-24 rounded-full ${palette.line}`} />
              <div className={`mt-2 h-2.5 w-36 rounded-full ${palette.line}`} />
            </div>
          </>
        )}
      </div>
      <p className="mt-4 text-[15px] font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function ActionChip({ label, onClick, primary = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold ${
        primary
          ? 'bg-primary text-white'
          : 'border border-border bg-card text-foreground'
      }`}
    >
      <Plus size={14} weight="bold" />
      {label}
    </button>
  )
}

function HeroPrimaryButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-[#1F5A47] shadow-sm transition-colors active:bg-white/90"
    >
      <Plus size={16} weight="bold" className="text-[#1F5A47]" />
      {label}
    </button>
  )
}

export default function EmptyStates() {
  const navigate = useNavigate()
  const { currentUser } = useApp()

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="flex-1 overflow-y-auto pb-24">
        <section className="min-h-[212px] rounded-b-[28px] bg-[#1F5A47] px-7 pt-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/communication')}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors active:bg-white/15"
              aria-label="Notifications"
            >
              <Bell size={19} weight="bold" />
            </button>
          </div>

          <div className="mt-4">
            <p className="text-[23px] font-semibold tracking-[-0.02em] text-white">
              Hello {currentUser?.name?.split(' ')[0] || 'Teacher'},
            </p>
          </div>

          <div className="mt-5">
            <HeroPrimaryButton label="Add your timetable" onClick={() => navigate('/schedule/timetable')} />
          </div>
        </section>

        <main className="space-y-8 px-6 pt-6">
          <section>
            <div className="mt-3">
              <IllustrationCard
                icon={MegaphoneSimple}
                tone="blue"
                variant="messages"
                title="Messages"
                subtitle="Messages is where school circulars, announcements, and teacher communication will appear first."
              />
              <div className="mt-3">
                <ActionChip label="Write a message" onClick={() => navigate('/communication')} primary />
              </div>
            </div>
          </section>

          <section>
            <div className="mt-3">
              <IllustrationCard
                icon={CalendarPlus}
                tone="green"
                variant="events"
                title="Events"
                subtitle="Events is where practice sessions, school activities, and class reminders will be created."
              />
              <div className="mt-3 flex gap-2">
                <ActionChip label="Create an event" onClick={() => navigate('/schedule')} primary />
              </div>
            </div>
          </section>

          <section>
            <div className="mt-3">
              <IllustrationCard
                icon={Rows}
                tone="amber"
                title="Reports"
                subtitle="Reports is where class-wise student report generation and completion status will show up."
              />
              <div className="mt-3 flex gap-2">
                <ActionChip label="Generate a report" onClick={() => navigate('/reports')} primary />
              </div>
            </div>
          </section>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
