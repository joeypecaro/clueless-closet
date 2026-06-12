import { forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  iconOnly?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent-yellow text-text-primary font-semibold ' +
    'hover:bg-accent-yellow-dark active:scale-95',
  secondary:
    'bg-neutral-100 text-text-primary font-medium ' +
    'hover:bg-neutral-200 active:scale-95',
  ghost:
    'bg-transparent text-text-secondary font-medium ' +
    'hover:bg-neutral-100 active:bg-neutral-200',
  destructive:
    'bg-error/10 text-error font-medium ' +
    'hover:bg-error/20 active:scale-95',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-4 py-2 rounded-xl min-h-[36px]',
  md: 'text-sm px-5 py-3 rounded-xl min-h-[44px]',
  lg: 'text-base px-6 py-3.5 rounded-2xl min-h-[52px]',
}

const iconSizeClasses: Record<Size, string> = {
  sm: 'w-9 h-9 rounded-xl',
  md: 'w-11 h-11 rounded-xl',
  lg: 'w-12 h-12 rounded-2xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      iconOnly = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading
    const base =
      'inline-flex items-center justify-center gap-2 ' +
      'transition-all duration-150 select-none ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-yellow focus-visible:ring-offset-2 '

    const sizeClass = iconOnly ? iconSizeClasses[size] : sizeClasses[size]
    const widthClass = fullWidth && !iconOnly ? 'w-full' : ''
    const disabledClass = isDisabled ? 'opacity-40 pointer-events-none' : ''

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${base} ${variantClasses[variant]} ${sizeClass} ${widthClass} ${disabledClass} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Spinner />
            {!iconOnly && children}
          </span>
        ) : (
          children
        )}
      </button>
    )
  },
)
Button.displayName = 'Button'

function Spinner() {
  return (
    <svg
      className="animate-spin w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        d="M12 2a10 10 0 1 0 10 10"
        strokeOpacity={0.3}
      />
      <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}

export default Button
