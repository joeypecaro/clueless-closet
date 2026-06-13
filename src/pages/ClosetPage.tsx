import { useMemo, useState } from 'react'
import { useItems } from '../hooks/useItems'
import { useToast } from '../contexts/ToastContext'
import PageHeader, { IconButton } from '../components/layout/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import Sheet from '../components/ui/Sheet'
import ItemCard from '../components/closet/ItemCard'
import ItemFormSheet from '../components/closet/ItemFormSheet'
import ItemDetailSheet from '../components/closet/ItemDetailSheet'
import type { Item, ItemCategory } from '../types/database'
import type { NewItemData } from '../hooks/useItems'
import { CATEGORY_META, SORT_OPTIONS, type SortOption } from '../lib/constants'

type View = 'closet' | 'wishlist'

const ALL_CATEGORIES: Array<{ value: ItemCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  ...CATEGORY_META.map(({ value, label }) => ({ value, label })),
]

export default function ClosetPage() {
  const { items, loading, addItem, updateItem, deleteItem, toggleWishlist } = useItems()
  const { showToast } = useToast()

  const [view, setView] = useState<View>('closet')
  const [category, setCategory] = useState<ItemCategory | 'all'>('all')
  const [sort, setSort] = useState<SortOption>('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [detailItem, setDetailItem] = useState<Item | null>(null)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    let list = items.filter((i) => i.is_wishlist === (view === 'wishlist'))
    if (category !== 'all') list = list.filter((i) => i.category === category)
    if (sort === 'most-worn') list = [...list].sort((a, b) => b.wear_count - a.wear_count)
    if (sort === 'least-worn') list = [...list].sort((a, b) => a.wear_count - b.wear_count)
    // 'newest' is default order from Supabase (created_at desc)
    return list
  }, [items, view, category, sort])

  async function handleAdd(data: NewItemData, photoFile: File | null) {
    if (!photoFile) {
      showToast('Please add a photo first 📸', 'info')
      return
    }
    setSaving(true)
    const { error } = await addItem(data, photoFile)
    setSaving(false)
    if (error) {
      showToast('Totally buggin\' — couldn\'t save item', 'error')
    } else {
      setAddOpen(false)
      showToast('Added to your closet ✨', 'success')
    }
  }

  async function handleEdit(data: NewItemData, _photoFile: File | null) {
    if (!editItem) return
    setSaving(true)
    const { error } = await updateItem(editItem.id, data)
    setSaving(false)
    if (error) {
      showToast('Totally buggin\' — couldn\'t save changes', 'error')
    } else {
      setEditItem(null)
      showToast('Item updated ✨', 'success')
    }
  }

  async function handleDelete(id: string) {
    const { error } = await deleteItem(id)
    if (error) showToast('Totally buggin\' — couldn\'t delete item', 'error')
    else showToast('Gone from your closet.', 'info')
  }

  async function handleToggleWishlist(id: string, isWishlist: boolean) {
    const { error } = await toggleWishlist(id, isWishlist)
    if (!error && !isWishlist) showToast('Moved to your closet! 🎉', 'success')
    if (error) showToast('Totally buggin\' — try again', 'error')
  }

  const ownedCount = items.filter((i) => !i.is_wishlist).length
  const wishCount = items.filter((i) => i.is_wishlist).length

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Your Closet"
        right={
          <IconButton label="Sort" onClick={() => setSortOpen(true)}>
            <SortIcon />
          </IconButton>
        }
      />

      {/* Closet / Wishlist toggle */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div className="flex bg-neutral-100 rounded-2xl p-1">
          {([
            { v: 'closet', label: '👗 Closet', count: ownedCount },
            { v: 'wishlist', label: '✨ Wishlist', count: wishCount },
          ] as const).map(({ v, label, count }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`
                flex-1 py-2 rounded-xl text-sm font-medium
                transition-all duration-200 select-none flex items-center justify-center gap-1.5
                ${view === v ? 'bg-white shadow-card text-text-primary' : 'text-text-secondary'}
              `}
            >
              {label}
              {count > 0 && (
                <span className={`text-2xs font-bold px-1.5 py-0.5 rounded-full ${view === v ? 'bg-neutral-100 text-text-secondary' : 'bg-neutral-200 text-text-tertiary'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter — horizontal scroll */}
      <div className="flex-shrink-0 overflow-x-auto pb-3">
        <div className="flex gap-2 px-4" style={{ width: 'max-content' }}>
          {ALL_CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCategory(value as ItemCategory | 'all')}
              className={`
                px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap
                transition-all duration-150 active:scale-95 select-none
                ${category === value
                  ? 'bg-accent-yellow text-text-primary'
                  : 'bg-neutral-100 text-text-secondary'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Item grid */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji={view === 'closet' ? '👗' : '✨'}
            title={
              category !== 'all'
                ? `No ${CATEGORY_META.find((c) => c.value === category)?.label.toLowerCase() ?? 'items'} yet`
                : view === 'closet'
                ? 'Your closet is empty'
                : 'No wishlist items yet'
            }
            description={
              view === 'closet'
                ? 'Tap the + button to add your first item.'
                : 'Mark items as wishlist when adding to track what you want.'
            }
            action={view === 'closet' ? { label: 'Add an item', onClick: () => setAddOpen(true) } : undefined}
            className="mt-6"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => setDetailItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        aria-label="Add item"
        onClick={() => setAddOpen(true)}
        className="fixed z-30 w-14 h-14 rounded-full bg-accent-yellow shadow-card-raised flex items-center justify-center transition-all duration-150 active:scale-90 select-none"
        style={{
          bottom: `calc(68px + env(safe-area-inset-bottom) + 16px)`,
          right: `max(16px, calc((100vw - 430px) / 2 + 16px))`,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1C1C1E" strokeWidth={2.5} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Sort sheet */}
      <Sheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        <div className="px-5 pb-6 flex flex-col gap-2">
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setSort(value); setSortOpen(false) }}
              className={`
                flex items-center justify-between px-4 py-3.5 rounded-xl
                transition-colors duration-150 active:bg-neutral-100 select-none
                ${sort === value ? 'bg-accent-yellow/20' : ''}
              `}
            >
              <span className={`text-sm font-medium ${sort === value ? 'text-text-primary' : 'text-text-secondary'}`}>
                {label}
              </span>
              {sort === value && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#F5C400" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M3 8l3.5 3.5L13 4.5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </Sheet>

      {/* Add item */}
      <ItemFormSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAdd}
        mode="add"
        saving={saving}
      />

      {/* Edit item */}
      <ItemFormSheet
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        onSave={handleEdit}
        mode="edit"
        initialItem={editItem ?? undefined}
        saving={saving}
      />

      {/* Item detail */}
      <ItemDetailSheet
        item={detailItem}
        open={detailItem !== null}
        onClose={() => setDetailItem(null)}
        onEdit={(item) => { setDetailItem(null); setEditItem(item) }}
        onDelete={handleDelete}
        onToggleWishlist={handleToggleWishlist}
      />
    </div>
  )
}

function SortIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M4 6h12M6 10h8M8 14h4" />
    </svg>
  )
}
