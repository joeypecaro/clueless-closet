import Sheet from '../ui/Sheet'
import type { Item, ItemCategory } from '../../types/database'
import { CATEGORY_META } from '../../lib/constants'
import { getItemPhotoUrl } from '../../hooks/useItems'

interface SwapSheetProps {
  open: boolean
  onClose: () => void
  category: ItemCategory | null
  currentItemId: string | null
  items: Item[]
  onSelect: (item: Item) => void
}

export default function SwapSheet({
  open,
  onClose,
  category,
  currentItemId,
  items,
  onSelect,
}: SwapSheetProps) {
  const meta = CATEGORY_META.find((c) => c.value === category)
  const categoryItems = items.filter(
    (i) => i.category === category && !i.is_wishlist,
  )

  return (
    <Sheet open={open} onClose={onClose} title={`Swap ${meta?.label ?? ''}`}>
      <div className="px-4 pb-6">
        {categoryItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-3">{meta?.emoji}</p>
            <p className="text-sm text-text-secondary">
              No other {meta?.label.toLowerCase()} in your closet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {categoryItems.map((item) => {
              const isActive = item.id === currentItemId
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item); onClose() }}
                  className={`
                    flex items-center gap-3 p-3 rounded-2xl transition-all duration-150 active:scale-[0.98] w-full text-left
                    ${isActive ? 'bg-accent-yellow/20 ring-1 ring-accent-yellow' : 'bg-neutral-50'}
                  `}
                >
                  <img
                    src={getItemPhotoUrl(item.photo_url)}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                    {item.brand && (
                      <p className="text-xs text-text-tertiary mt-0.5">{item.brand}</p>
                    )}
                  </div>
                  {isActive && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#F5C400" strokeWidth={2.5} strokeLinecap="round" className="flex-shrink-0">
                      <path d="M3 8l3.5 3.5L13 4.5" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Sheet>
  )
}
