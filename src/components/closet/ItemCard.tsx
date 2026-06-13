import type { Item } from '../../types/database'
import { COLOR_HEX } from '../../lib/constants'
import { getItemPhotoUrl } from '../../hooks/useItems'

interface ItemCardProps {
  item: Item
  onClick: () => void
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  const photoUrl = getItemPhotoUrl(item.photo_url)

  return (
    <button
      onClick={onClick}
      className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 w-full block active:scale-[0.97] transition-transform duration-150 select-none"
    >
      <img
        src={photoUrl}
        alt={item.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Bottom gradient + info */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-3 pb-3 pt-8">
        <p className="text-white text-xs font-semibold leading-tight truncate drop-shadow">
          {item.name}
        </p>
        {item.colors.length > 0 && (
          <div className="flex gap-1 mt-1.5 items-center">
            {item.colors.slice(0, 5).map((color) => (
              <div
                key={color}
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: COLOR_HEX[color] ?? '#8E8E93',
                  border: color === 'white' ? '1px solid rgba(255,255,255,0.5)' : undefined,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.15)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Wishlist badge */}
      {item.is_wishlist && (
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5">
          <span className="text-2xs font-semibold text-text-primary">✨ Wish</span>
        </div>
      )}

      {/* Wear count badge */}
      {item.wear_count > 0 && (
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center">
          <span className="text-2xs font-bold text-white">{item.wear_count}</span>
        </div>
      )}
    </button>
  )
}
