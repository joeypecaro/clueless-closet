import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'
import type { Item, Outfit } from '../../types/database'
import { CATEGORY_META, COLOR_HEX, COLOR_OPTIONS } from '../../lib/constants'
import { getItemPhotoUrl } from '../../hooks/useItems'

interface ItemDetailSheetProps {
  item: Item | null
  open: boolean
  onClose: () => void
  onEdit: (item: Item) => void
  onDelete: (id: string) => Promise<void>
  onToggleWishlist: (id: string, isWishlist: boolean) => Promise<void>
}

export default function ItemDetailSheet({
  item,
  open,
  onClose,
  onEdit,
  onDelete,
  onToggleWishlist,
}: ItemDetailSheetProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [outfits, setOutfits] = useState<Outfit[]>([])

  useEffect(() => {
    if (!item || !open) return
    setDeleteConfirm(false)
    // Fetch outfits that include this item
    supabase
      .from('outfits')
      .select('*')
      .contains('item_ids', [item.id])
      .limit(5)
      .then(({ data }) => setOutfits(data ?? []))
  }, [item, open])

  if (!item) return null

  const categoryMeta = CATEGORY_META.find((c) => c.value === item.category)
  const photoUrl = getItemPhotoUrl(item.photo_url)

  async function handleDelete() {
    if (!deleteConfirm) { setDeleteConfirm(true); return }
    setDeleting(true)
    await onDelete(item.id)
    setDeleting(false)
    onClose()
  }

  async function handleToggleWishlist() {
    await onToggleWishlist(item.id, !item.is_wishlist)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} snapPoints="full">
      <div className="flex flex-col h-full overflow-y-auto overscroll-contain">
        {/* Photo */}
        <div className="relative flex-shrink-0">
          <img
            src={photoUrl}
            alt={item.name}
            className="w-full aspect-square object-cover"
          />
          {item.is_wishlist && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-xs font-semibold text-text-primary">✨ Wishlist</span>
            </div>
          )}
          {item.wear_count > 0 && (
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-xs font-semibold text-white">Worn {item.wear_count}×</span>
            </div>
          )}
        </div>

        <div className="px-5 pt-5 pb-8 flex flex-col gap-5">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{categoryMeta?.emoji}</span>
                <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                  {categoryMeta?.label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-text-primary">{item.name}</h2>
              {item.brand && (
                <p className="text-sm text-text-secondary mt-0.5">{item.brand}</p>
              )}
            </div>
            <button
              onClick={() => { onClose(); setTimeout(() => onEdit(item), 50) }}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center active:bg-neutral-200 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#636366" strokeWidth={2} strokeLinecap="round">
                <path d="M11 2l3 3-8.5 8.5-3 .5.5-3L11 2z" />
              </svg>
            </button>
          </div>

          {/* Colors */}
          {item.colors.length > 0 && (
            <div>
              <p className={label}>Colors</p>
              <div className="flex gap-2 flex-wrap">
                {item.colors.map((color) => {
                  const meta = COLOR_OPTIONS.find((c) => c.value === color)
                  return (
                    <div key={color} className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: COLOR_HEX[color] ?? '#8E8E93',
                          border: meta?.border ? '1px solid #D1D1C8' : undefined,
                          boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                        }}
                      />
                      <span className="text-sm text-text-secondary capitalize">{color}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tags grid */}
          {(item.style_tags.length > 0 || item.seasons.length > 0 || item.occasions.length > 0) && (
            <div className="grid grid-cols-3 gap-3">
              {item.style_tags.length > 0 && (
                <TagGroup label="Style" tags={item.style_tags} />
              )}
              {item.seasons.length > 0 && (
                <TagGroup label="Season" tags={item.seasons} />
              )}
              {item.occasions.length > 0 && (
                <TagGroup label="For" tags={item.occasions} />
              )}
            </div>
          )}

          {/* Wishlist link */}
          {item.is_wishlist && item.wishlist_link && (
            <a
              href={item.wishlist_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-500 font-medium underline underline-offset-2"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M5 9L9 5M9 5H6M9 5V8"/><rect x="1" y="1" width="12" height="12" rx="2"/></svg>
              View in shop
            </a>
          )}

          {/* Outfits featuring this */}
          {outfits.length > 0 && (
            <div>
              <p className={label}>In {outfits.length} outfit{outfits.length > 1 ? 's' : ''}</p>
              <div className="flex flex-col gap-1.5">
                {outfits.map((o) => (
                  <div key={o.id} className="flex items-center gap-2 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-yellow flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{o.name ?? 'Untitled outfit'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            {item.is_wishlist && (
              <Button variant="primary" size="lg" fullWidth onClick={handleToggleWishlist}>
                Got it! Move to closet 🎉
              </Button>
            )}

            {deleteConfirm ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-center text-text-secondary">
                  Way harsh — delete <strong>{item.name}</strong> forever?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="md"
                    fullWidth
                    loading={deleting}
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={() => setDeleteConfirm(false)}
                  >
                    Keep it
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleDelete}
                className="text-sm text-error font-medium py-2 active:opacity-60 transition-opacity"
              >
                Delete item
              </button>
            )}
          </div>
        </div>
      </div>
    </Sheet>
  )
}

function TagGroup({ label: title, tags }: { label: string; tags: string[] }) {
  return (
    <div className="bg-neutral-50 rounded-xl p-3">
      <p className="text-2xs font-semibold text-text-tertiary uppercase tracking-wide mb-1.5">{title}</p>
      <div className="flex flex-col gap-0.5">
        {tags.map((t) => (
          <span key={t} className="text-xs text-text-secondary capitalize truncate">{t}</span>
        ))}
      </div>
    </div>
  )
}

const label = 'text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2 block'
