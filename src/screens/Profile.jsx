import { useNavigate } from 'react-router-dom'
import { EnvelopeSimple, Lifebuoy, SignOut } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { currentUser, logout, switchRole } = useApp()

  if (!currentUser) return null

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">

        {/* Hero banner — full bleed, no rounded corners, subtle blue */}
        <div className="h-28 bg-cover bg-center" style={{ backgroundImage: 'url(/profile-hero-bg.png)' }} />

        {/* Avatar + Name + Badge */}
        <div className="flex flex-col items-center -mt-10 px-4">
          <Avatar className="w-20 h-20 ring-2 ring-background">
            <AvatarFallback
              className="font-bold text-2xl"
              style={{ backgroundColor: 'var(--color-avatar-accent)', color: 'var(--color-avatar-accent-foreground)' }}
            >
              {currentUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-foreground mt-3">{currentUser.name}</h2>
          <Badge variant="secondary" className="mt-2">Teacher</Badge>
        </div>

        {/* Info rows */}
        <div className="px-4 mt-6 pb-[89px] flex-1 flex flex-col gap-4">
          <InfoRow label="Email" value={currentUser.email} />
          <InfoRow label="Phone Number" value={currentUser.phone} />

          <hr className="border-border" />

          <InfoRow label="School Name" value={currentUser.institute} />

          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">Help & admin</p>
          <div className="flex flex-col divide-y divide-border">
            <a
              href={`mailto:${currentUser.email}?subject=Admin support request`}
              className="py-3 flex items-center gap-3 active:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <EnvelopeSimple size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground">Contact admin</p>
              </div>
            </a>
            <a
              href="mailto:support@qfix.example?subject=Teacher Hub support"
              className="py-3 flex items-center gap-3 active:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Lifebuoy size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground">Support email</p>
                <p className="text-[13px] text-muted-foreground truncate">support@qfix.example</p>
              </div>
            </a>
          </div>

          {/* Spacer pushes logout to bottom */}
          <div className="flex-1" />

          {/* Switch role */}
          <Button
            variant="outline"
            className="w-full h-11 gap-2"
            style={{ border: '1px solid var(--input)' }}
            onClick={() => { switchRole(currentUser.role === 'school' ? 'college' : 'school'); navigate('/home') }}
          >
            For demo - switch to {currentUser.role === 'school' ? 'college' : 'school'} teacher
          </Button>

          {/* Logout */}
          <Button
            variant="outline"
            className="w-full h-11 text-destructive gap-2"
            style={{ border: '1px solid var(--input)' }}
            onClick={handleLogout}
          >
            <SignOut size={18} />
            Logout
          </Button>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}
