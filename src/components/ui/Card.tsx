interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  raised?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export default function Card({
  children,
  className = '',
  onClick,
  raised = false,
  padding = 'md',
}: CardProps) {
  const base = 'bg-white rounded-2xl overflow-hidden'
  const shadow = raised ? 'shadow-card-raised' : 'shadow-card'
  const interactive = onClick
    ? 'cursor-pointer transition-transform duration-150 active:scale-[0.98]'
    : ''

  return (
    <div
      className={`${base} ${shadow} ${interactive} ${paddingClasses[padding]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
