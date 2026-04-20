import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const GENERIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PINE_EMAIL_REGEX = /^[a-zA-Z]+\.[a-zA-Z]+@pinelabs\.com$/
const VALID_PASSWORD = 'qwerty'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const { login } = useApp()
  const navigate = useNavigate()

  const deriveName = (emailStr) => {
    const local = emailStr.split('@')[0]
    return local
      .split(/[._-]/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  const handleLogin = (role, nameOverride) => {
    setLoading(true)
    setTimeout(() => {
      login(role, nameOverride)
      navigate('/home')
      setLoading(false)
    }, 300)
  }

  const prefillSchool = () => {
    setEmail(''); setPassword(''); setEmailError(''); setPasswordError('')
    handleLogin('school')
  }

  const prefillCollege = () => {
    setEmail(''); setPassword(''); setEmailError(''); setPasswordError('')
    handleLogin('college')
  }

  const handleSignIn = () => {
    let emailErr = ''
    let passwordErr = ''

    if (!GENERIC_EMAIL_REGEX.test(email)) {
      emailErr = 'Enter a valid email'
    } else if (!PINE_EMAIL_REGEX.test(email)) {
      emailErr = 'Could not find any teacher with this email'
    }

    if (!emailErr && password !== VALID_PASSWORD) {
      passwordErr = 'Incorrect password'
    }

    setEmailError(emailErr)
    setPasswordError(passwordErr)

    if (emailErr || passwordErr) return
    handleLogin('school', deriveName(email))
  }

  return (
    <div className="h-full bg-stone-50 flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <span className="text-[32px] font-bold tracking-tight text-primary">
            QFix
          </span>
          <span className="text-[13px] font-medium tracking-widest uppercase text-muted-foreground mt-0.5">
            Teacher's Hub
          </span>
          <div className="mt-2 w-8 h-0.5 rounded-full bg-primary opacity-30" />
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-[22px] font-semibold text-foreground mb-1">Sign in</h1>
          <p className="text-[13px] text-muted-foreground mb-6">Enter the teacher credentials provided by your admin</p>

          <div className="mb-4">
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError('') }}
              placeholder="Enter your email here"
              className={`h-12 rounded-lg text-[15px] ${emailError ? 'border-destructive focus-visible:ring-destructive' : 'border-border'}`}
            />
            {emailError && <p className="text-[12px] text-destructive mt-1">{emailError}</p>}
          </div>

          <div className="mb-6">
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError('') }}
                placeholder="Enter your password here"
                className={`h-12 rounded-lg text-[15px] pr-12 ${emailError || passwordError ? 'border-destructive focus-visible:ring-destructive' : 'border-border'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 z-10"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword
                  ? <EyeSlash size={18} color="var(--color-muted-foreground)" />
                  : <Eye size={18} color="var(--color-muted-foreground)" />
                }
              </button>
            </div>
            {passwordError && !emailError && <p className="text-[12px] text-destructive mt-1">{passwordError}</p>}
          </div>

          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full h-12 text-[15px] font-semibold rounded-lg disabled:opacity-60"
            style={{ background: 'linear-gradient(180deg, var(--teacher-brand-700) 0%, var(--teacher-brand-800) 100%)' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </div>
      </div>

      {/* Quick demo */}
      <div className="px-6 pb-10">
        <p className="text-[13px] text-muted-foreground mb-3">For quick demo, continue as:</p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={prefillSchool}
            className="flex-1 h-12 rounded-lg text-[14px] font-medium"
            style={{ border: '1px solid var(--input)' }}
          >
            School Teacher
          </Button>
          <Button
            variant="outline"
            onClick={prefillCollege}
            className="flex-1 h-12 rounded-lg text-[14px] font-medium"
            style={{ border: '1px solid var(--input)' }}
          >
            College Teacher
          </Button>
        </div>
      </div>
    </div>
  )
}
