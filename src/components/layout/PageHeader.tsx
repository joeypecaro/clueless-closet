interface PageHeaderProps {
  title?: string
  left?: React.ReactNode
  right?: React.ReactNode
  className?: string
  transparent?: boolean
}

export default function PageHeader({
  title,
  left,
  right,
  className = '',
  transparent = false,
}: PageHeaderProps) {
  return (
    <header
      className={`
        relative flex items-center justify-between
        px-4 flex-shrink-0
        ${transparent ? '' : 'bg-background/95 backdrop-blur-xl border-b border-neutral-100/80'}
        ${className}
      `}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        height: 'calc(56px + env(safe-area-inset-top))',
        alignItems: 'flex-end',
        paddingBottom: '6px',
      }}
    >
      <div className="flex items-center gap-2 min-w-[44px]">
        {left}
      </div>

      {title && (
        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-text-primary pointer-events-none">
          {title}
        </h1>
      )}

      <div className="flex items-center gap-2 min-w-[44px] justify-end">
        {right}
      </div>
    </header>
  )
}

export function IconButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode
  onClick?: () => void
  label: string
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary
                 transition-all duration-150 active:bg-neutral-100 active:scale-95 select-none"
    >
      {children}
    </button>
  )
}
