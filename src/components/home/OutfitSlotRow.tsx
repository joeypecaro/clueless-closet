import type { Item, ItemCategory } from '../../types/database'
import { CATEGORY_META } from '../../lib/constants'
import { getItemPhotoUrl } from '../../hooks/useItems'

interface OutfitSlotRowProps {
  category: ItemCategory
  item: Item
  locked: boolean
  onLockToggle: () => void
  onTap: () => void
  isLast?: boolean
}

export default function OutfitSlotRow({
  category,
  item,
  locked,
  onLockToggle,
  onTap,
  isLast = false,
}: OutfitSlotRowProps) {
  const categoryMeta = CATEGORY_META.find((c) => c.value === category)
  const photoUrl = getItemPhotoUrl(item.photo_url)

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${!isLast ? 'border-b border-neutral-100' : ''}`}>
      {/* Tap area: photo + text → opens swap */}
      <button
        onClick={onTap}
        className="flex items-center gap-3 flex-1 min-w-0 active:opacity-70 transition-opacity text-left"
      >
        <div className="relative flex-shrink-0">
          <img
            src={photoUrl}
            alt={item.name}
            className="w-14 h-14 rounded-xl object-cover"
          />
          {locked && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-yellow rounded-full flex items-center justify-center shadow-card">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="#1C1C1E">
                <rect x="1.5" y="3.5" width="5" height="3.5" rx="0.75" />
                <path d="M2.5 3.5V2.5a1.5 1.5 0 0 1 3 0v1" stroke="#1C1C1E" strokeWidth="1" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-2xs font-semibold text-text-tertiary uppercase tracking-wide leading-none mb-0.5">
            {categoryMeta?.emoji} {categoryMeta?.label}
          </p>
          <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
          <p className="text-xs text-text-tertiary mt-0.5">Tap to swap</p>
        </div>
      </button>

      {/* Lock toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); onLockToggle() }}
        className={`
          flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
          transition-all duration-150 active:scale-90
          ${locked ? 'bg-accent-yellow text-text-primary' : 'bg-neutral-100 text-neutral-400'}
        `}
        aria-label={locked ? 'Unlock slot' : 'Lock slot'}
      >
        {locked ? <LockClosed /> : <LockOpen />}
      </button>
    </div>
  )
}

function LockClosed() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <rect x="3" y="7" width="10" height="8" rx="1.5" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

function LockOpen() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <rect x="3" y="7" width="10" height="8" rx="1.5" />
      <path d="M5 7V5a3 3 0 0 1 6 0" />
    </svg>
  )
}
