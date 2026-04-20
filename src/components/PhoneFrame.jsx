import { Toaster } from '@/components/ui/sonner'

export default function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen bg-[#e8e8ed] flex items-center justify-center">
      <div
        className="relative bg-white overflow-hidden"
        style={{ width: '412px', height: '917px', boxShadow: '0 0 40px rgba(0,0,0,0.15)' }}
      >
        {/* App content */}
        <div id="phone-viewport" className="absolute inset-0 overflow-hidden bg-stone-50">
          <div className="h-full route-stage">
            {children}
          </div>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#1c1917',
                color: 'white',
                borderRadius: '12px',
                fontSize: '14px',
                border: 'none',
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
