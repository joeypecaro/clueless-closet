import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  snapPoints?: 'auto' | 'half' | 'full'
}

export default function Sheet({ open, onClose, children, title, snapPoints = 'auto' }: SheetProps) {
  const [rendered, setRendered] = useState(false)
  const [animating, setAnimating] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setRendered(true)
      requestAnimationFrame(() => setAnimating(true))
    } else {
      setAnimating(false)
      const timer = setTimeout(() => setRendered(false), 320)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!rendered) return null

  const maxHeightClass = {
    auto: 'max-h-[90dvh]',
    half: 'h-[50dvh]',
    full: 'h-[92dvh]',
  }[snapPoints]

  return createPortal(
    <div className="fixed inset-0 z-50" style={{ maxWidth: '430px', margin: '0 auto' }}>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 transition-opacity duration-300"
        style={{ opacity: animating ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl flex flex-col ${maxHeightClass} transition-transform duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)]`}
        style={{
          transform: animating ? 'translateY(0)' : 'translateY(100%)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -4px 32px 0 rgba(0,0,0,0.12)',
        }}
      >
        {/* Handle */}
        <div className="flex-shrink-0 pt-3 pb-2">
          <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto" />
        </div>

        {/* Title */}
        {title && (
          <div className="flex-shrink-0 flex items-center justify-between px-5 pb-3">
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-text-secondary active:bg-neutral-200 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
