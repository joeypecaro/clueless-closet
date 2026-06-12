interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
}

export default function Chip({ label, active = false, onClick, disabled = false, icon }: ChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium
        transition-all duration-150 select-none whitespace-nowrap
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-yellow
        ${active
          ? 'bg-accent-yellow text-text-primary'
          : 'bg-neutral-100 text-text-secondary hover:bg-neutral-200'
        }
        ${disabled ? 'opacity-40 pointer-events-none' : 'active:scale-95'}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </button>
  )
}

interface ChipGroupProps {
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>
  value: string | string[]
  onChange: (value: string) => void
  multi?: boolean
  className?: string
}

export function ChipGroup({ options, value, onChange, multi = false, className = '' }: ChipGroupProps) {
  const isActive = (v: string) =>
    Array.isArray(value) ? value.includes(v) : value === v

  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          icon={opt.icon}
          active={isActive(opt.value)}
          onClick={() => onChange(opt.value)}
        />
      ))}
    </div>
  )
}
