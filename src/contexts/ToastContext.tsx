import { createContext, useCallback, useContext, useRef, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    timers.current.delete(id)
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev.slice(-2), { id, message, type }])
      const timer = setTimeout(() => removeToast(id), 3200)
      timers.current.set(id, timer)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-neutral-900 text-white',
  error: 'bg-error text-white',
  info: 'bg-neutral-900 text-white',
}

const typeIcons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M3 8l3.5 3.5L13 4.5" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M8 5v4M8 11.5v.5" />
      <path d="M8 1L15 14H1L8 1z" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <circle cx="8" cy="8" r="7" />
      <path d="M8 7v5M8 5v.5" />
    </svg>
  ),
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none"
      style={{
        maxWidth: '430px',
        margin: '0 auto',
        paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            w-full pointer-events-auto flex items-center gap-3
            px-4 py-3 rounded-2xl shadow-card-raised
            animate-toast-in
            ${typeStyles[toast.type]}
          `}
          onClick={() => onDismiss(toast.id)}
        >
          <span className="flex-shrink-0 opacity-80">{typeIcons[toast.type]}</span>
          <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
        </div>
      ))}
    </div>
  )
}
