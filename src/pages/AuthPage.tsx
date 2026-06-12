import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Button from '../components/ui/Button'

type Mode = 'signin' | 'signup'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const { showToast } = useToast()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) {
        showToast('Totally buggin\' — ' + friendlyError(error.message), 'error')
      }
    } else {
      if (!displayName.trim()) {
        showToast('We need your name first ✨', 'error')
        setLoading(false)
        return
      }
      const { error, needsConfirmation } = await signUp(email, password, displayName)
      if (error) {
        showToast('Totally buggin\' — ' + friendlyError(error.message), 'error')
      } else if (needsConfirmation) {
        setConfirmed(true)
      }
    }

    setLoading(false)
  }

  if (confirmed) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="text-6xl mb-5">📬</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Check your inbox</h2>
          <p className="text-sm text-text-secondary max-w-xs leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="font-semibold text-text-primary">{email}</span>. Click it to
            activate your account, then come back and sign in.
          </p>
          <button
            className="mt-8 text-sm text-text-secondary underline underline-offset-2"
            onClick={() => { setConfirmed(false); setMode('signin') }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Logo / header */}
      <div
        className="flex flex-col items-center pt-16 pb-8 px-8"
        style={{ paddingTop: 'calc(64px + env(safe-area-inset-top))' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-accent-yellow flex items-center justify-center text-3xl mb-4 shadow-card">
          👗
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Clueless Closet</h1>
        <p className="text-sm text-text-secondary mt-1">
          {mode === 'signin' ? 'Welcome back ✨' : 'Start building your closet'}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="px-6 mb-6">
        <div className="flex bg-neutral-100 rounded-2xl p-1">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`
                flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 select-none
                ${mode === m ? 'bg-white shadow-card text-text-primary' : 'text-text-secondary'}
              `}
            >
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-6 gap-3">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
              Your name
            </label>
            <input
              type="text"
              autoComplete="name"
              placeholder="Cher Horowitz"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="cher@beverlyhills.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
            Password
          </label>
          <input
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={inputClass}
          />
        </div>

        <div className="mt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </div>

        {mode === 'signin' && (
          <p className="text-center text-xs text-text-tertiary mt-1">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-text-primary font-semibold underline underline-offset-2"
            >
              Sign up
            </button>
          </p>
        )}
      </form>

      <p
        className="px-8 text-center text-xs text-text-tertiary pb-6"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
      >
        By continuing, you agree to store your wardrobe data securely.
      </p>
    </div>
  )
}

const inputClass =
  'w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-text-primary ' +
  'placeholder:text-text-tertiary min-h-[44px] ' +
  'focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-transparent ' +
  'transition-all duration-150'

function friendlyError(msg: string): string {
  if (msg.includes('Invalid login')) return 'Wrong email or password.'
  if (msg.includes('already registered')) return 'That email is already in use.'
  if (msg.includes('Password should')) return 'Password must be at least 6 characters.'
  if (msg.includes('rate limit')) return 'Too many attempts — try again in a minute.'
  return msg
}
