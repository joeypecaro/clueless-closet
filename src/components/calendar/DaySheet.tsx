import { useEffect, useState } from 'react'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { getItemPhotoUrl } from '../../hooks/useItems'
import { CATEGORY_META } from '../../lib/constants'
import type { Item, Outfit } from '../../types/database'
import type { CalendarEntryWithOutfit } from '../../hooks/useCalendar'

type View = 'detail' | 'plan'

interface DaySheetProps {
  open: boolean
  onClose: () => void
  date: string | null
  entry: CalendarEntryWithOutfit | null
  items: Item[]
  onPlan: (outfitId: string, status: 'planned' | 'worn') => Promise<void>
  onRemove: () => Promise<void>
  onToggleStatus: (status: 'planned' | 'worn') => Promise<void>
}

function formatDateFriendly(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default function DaySheet({
  open,
  onClose,
  date,
  entry,
  items,
  onPlan,
  onRemove,
  onToggleStatus,
}: DaySheetProps) {
  const { user } = useAuth()
  const [view, setView] = useState<View>('detail')
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([])
  const [loadingOutfits, setLoadingOutfits] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    if (open) {
      setView('detail')
      setConfirmRemove(false)
    }
  }, [open, date])

  async function switchToPlan() {
    if (!user) return
    setLoadingOutfits(true)
    setView('plan')
    const { data } = await supabase
      .from('outfits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setSavedOutfits(data ?? [])
    setLoadingOutfits(false)
  }

  async function handlePickOutfit(outfit: Outfit) {
    await onPlan(outfit.id, 'planned')
    setView('detail')
  }

  async function handleRemove() {
    if (!confirmRemove) {
      setConfirmRemove(true)
      return
    }
    setRemoving(true)
    await onRemove()
    setRemoving(false)
    onClose()
  }

  async function handleToggleStatus(status: 'planned' | 'worn') {
    if (entry?.status === status) return
    setToggling(true)
    await onToggleStatus(status)
    setToggling(false)
  }

  const entryItems = entry
    ? (entry.outfit.item_ids
        .map((id) => items.find((i) => i.id === id))
        .filter(Boolean) as Item[])
    : []

  const sheetTitle = view === 'plan' ? 'Pick an outfit' : (date ? formatDateFriendly(date) : '')

  return (
    <Sheet open={open} onClose={onClose} title={sheetTitle} snapPoints="full">
      {view === 'detail' ? (
        <DetailView
          entry={entry}
          entryItems={entryItems}
          confirmRemove={confirmRemove}
          removing={removing}
          toggling={toggling}
          onPlanOutfit={switchToPlan}
          onRemove={handleRemove}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <PlanView
          savedOutfits={savedOutfits}
          loading={loadingOutfits}
          currentOutfitId={entry?.outfit_id ?? null}
          items={items}
          onBack={() => setView('detail')}
          onSelect={handlePickOutfit}
        />
      )}
    </Sheet>
  )
}

// ── Detail view ──────────────────────────────────────────────────────────────

interface DetailViewProps {
  entry: CalendarEntryWithOutfit | null
  entryItems: Item[]
  confirmRemove: boolean
  removing: boolean
  toggling: boolean
  onPlanOutfit: () => void
  onRemove: () => void
  onToggleStatus: (status: 'planned' | 'worn') => void
}

function DetailView({
  entry,
  entryItems,
  confirmRemove,
  removing,
  toggling,
  onPlanOutfit,
  onRemove,
  onToggleStatus,
}: DetailViewProps) {
  if (!entry) {
    return (
      <div className="px-5 pb-8 flex flex-col items-center gap-5 pt-4">
        <div className="w-20 h-20 rounded-2xl bg-accent-yellow-light flex items-center justify-center text-4xl select-none">
          📅
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-text-primary">No outfit planned</p>
          <p className="text-sm text-text-tertiary mt-1">Pick one from your saved looks</p>
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={onPlanOutfit}>
          Plan an outfit →
        </Button>
      </div>
    )
  }

  return (
    <div className="px-5 pb-8 flex flex-col gap-5">
      {/* Outfit name + status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-text-primary leading-snug">
            {entry.outfit.name ?? 'Unnamed outfit'}
          </p>
          {entry.outfit.occasion && (
            <p className="text-sm text-text-tertiary mt-0.5 capitalize">{entry.outfit.occasion}</p>
          )}
        </div>
        <StatusBadge status={entry.status} />
      </div>

      {/* Item photo strip */}
      {entryItems.length > 0 && (
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1">
          {entryItems.map((item) => {
            const meta = CATEGORY_META.find((c) => c.value === item.category)
            return (
              <div key={item.id} className="flex-shrink-0 flex flex-col items-center gap-1">
                <img
                  src={getItemPhotoUrl(item.photo_url)}
                  alt={item.name}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
                <p className="text-xs text-text-tertiary">{meta?.emoji} {meta?.label}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Status toggle */}
      <div>
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
          Status
        </p>
        <div className="flex gap-2">
          {(['planned', 'worn'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onToggleStatus(s)}
              disabled={toggling}
              className={`
                flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-60
                ${entry.status === s
                  ? s === 'worn'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-accent-yellow text-text-primary'
                  : 'bg-neutral-100 text-text-secondary'
                }
              `}
            >
              {s === 'planned' ? '📅 Planned' : '✅ Worn'}
            </button>
          ))}
        </div>
      </div>

      {/* Change outfit */}
      <Button variant="secondary" size="md" fullWidth onClick={onPlanOutfit}>
        Change outfit
      </Button>

      {/* Remove */}
      <button
        onClick={onRemove}
        disabled={removing}
        className="w-full py-3 text-sm font-semibold text-red-500 transition-opacity active:opacity-60 disabled:opacity-40"
      >
        {confirmRemove ? 'Way harsh, Tai — tap again to confirm' : 'Remove from calendar'}
      </button>
    </div>
  )
}

function StatusBadge({ status }: { status: 'planned' | 'worn' }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0
        ${status === 'worn' ? 'bg-emerald-100 text-emerald-700' : 'bg-accent-yellow/20 text-text-primary'}`}
    >
      {status === 'worn' ? '✅ Worn' : '📅 Planned'}
    </span>
  )
}

// ── Plan view ────────────────────────────────────────────────────────────────

interface PlanViewProps {
  savedOutfits: Outfit[]
  loading: boolean
  currentOutfitId: string | null
  items: Item[]
  onBack: () => void
  onSelect: (outfit: Outfit) => void
}

function PlanView({ savedOutfits, loading, currentOutfitId, items, onBack, onSelect }: PlanViewProps) {
  return (
    <div className="px-4 pb-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-text-secondary mb-4 active:opacity-60"
      >
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          stroke="currentColor" strokeWidth={2} strokeLinecap="round"
        >
          <path d="M10 4L6 8l4 4" />
        </svg>
        Back
      </button>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[72px] bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : savedOutfits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-3 select-none">👗</p>
          <p className="text-sm font-semibold text-text-primary">No saved outfits yet</p>
          <p className="text-xs text-text-tertiary mt-1.5">
            Generate and save a look from the Home tab first
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {savedOutfits.map((outfit) => {
            const firstItem = items.find((i) => outfit.item_ids.includes(i.id))
            const isActive = outfit.id === currentOutfitId
            return (
              <button
                key={outfit.id}
                onClick={() => onSelect(outfit)}
                className={`
                  flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.98] text-left w-full
                  ${isActive ? 'bg-accent-yellow/20 ring-1 ring-accent-yellow' : 'bg-neutral-50'}
                `}
              >
                {firstItem ? (
                  <img
                    src={getItemPhotoUrl(firstItem.photo_url)}
                    alt={firstItem.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-neutral-200 flex-shrink-0 flex items-center justify-center text-2xl select-none">
                    👗
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {outfit.name ?? 'Unnamed outfit'}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5 capitalize">
                    {outfit.occasion ?? 'Everyday'} · {outfit.item_ids.length} items
                  </p>
                </div>
                {isActive && (
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    stroke="#F5C400" strokeWidth={2.5} strokeLinecap="round"
                    className="flex-shrink-0"
                  >
                    <path d="M3 8l3.5 3.5L13 4.5" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
