import { useRef, useEffect, useState } from 'react'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({})
  const activeIndex = options.findIndex((o) => o.value === value)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const buttons = container.querySelectorAll<HTMLButtonElement>('[data-segment]')
    const active = buttons[activeIndex]
    if (!active) return
    setIndicatorStyle({
      width: active.offsetWidth,
      transform: `translateX(${active.offsetLeft}px)`,
    })
  }, [activeIndex, options.length])

  return (
    <div
      ref={containerRef}
      className={`relative flex bg-neutral-100 rounded-2xl p-1 ${className}`}
    >
      {/* Sliding pill indicator */}
      <div
        className="absolute top-1 bottom-1 bg-white rounded-xl shadow-card transition-all duration-200 ease-out pointer-events-none"
        style={indicatorStyle}
      />

      {options.map((opt) => (
        <button
          key={opt.value}
          data-segment
          onClick={() => onChange(opt.value)}
          className={`
            relative z-10 flex-1 text-sm font-medium py-1.5 px-2 rounded-xl
            transition-colors duration-150 select-none whitespace-nowrap
            focus-visible:outline-none
            ${value === opt.value ? 'text-text-primary' : 'text-text-secondary'}
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
