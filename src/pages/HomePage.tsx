import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { useToast } from '../contexts/ToastContext'
import PageHeader, { IconButton } from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import OutfitSlotRow from '../components/home/OutfitSlotRow'
import SwapSheet from '../components/home/SwapSheet'
import SaveOutfitSheet from '../components/home/SaveOutfitSheet'
import {
  generateOutfit,
  outfitItemIds,
  outfitHistoryKey,
  hasSufficientItems,
  autoName,
  type GeneratedOutfit,
  type LockedSlots,
} from '../lib/outfitGenerator'
import { OCCASION_OPTIONS, currentSeason } from '../lib/constants'
import type { Item, ItemCategory } from '../types/database'

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})
const TODAY_ISO = new Date().toISOString().split('T')[0]

// Ordered slot display for each path
const DRESS_SLOTS: ItemCategory[] = ['dress', 'shoes', 'purse', 'accessory']
const TOPS_SLOTS: ItemCategory[] = ['top', 'bottom', 'shoes', 'purse', 'accessory']

export default function HomePage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { items, loading: itemsLoading, incrementWearCount } = useItems()
  const { saveOutfit, addToCalendar } = useOutfits()
  const { showToast } = useToast()

  const [occasion, setOccasion] = useState('everyday')
  const [outfit, setOutfit] = useState<GeneratedOutfit | null>(null)
  const [locked, setLocked] = useState<LockedSlots>({})
  const [generating, setGenerating] = useState(false)
  const history = useRef<string[]>([])

  // Swap sheet state
  const [swapCategory, setSwapCategory] = useState<ItemCategory | null>(null)

  // Save sheet state
  const [saveOpen, setSaveOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [wearingToday, setWearingToday] = useState(false)

  const firstName = profile?.display_name?.split(' ')[0] ?? 'there'
  const hasItems = !itemsLoading && hasSufficientItems(items)

  // Generate an outfit, respecting locked slots
  const generate = useCallback(
    (currentLocked: LockedSlots = locked) => {
      if (!hasItems) return
      setGenerating(true)
      // Small timeout so the "generating" pulse is visible on fast devices
      setTimeout(() => {
        const result = generateOutfit(items, occasion, currentSeason(), currentLocked, history.current)
        if (result) {
          setOutfit(result)
          const k = outfitHistoryKey(result)
          history.current = [k, ...history.current].slice(0, 3)
        }
        setGenerating(false)
      }, 180)
    },
    [items, occasion, hasItems, locked],
  )

  // Generate on first load when items are ready
  useEffect(() => {
    if (!itemsLoading && hasItems && !outfit) generate({})
  }, [itemsLoading, hasItems]) // eslint-disable-line react-hooks/exhaustive-deps

  // Regenerate when occasion changes (clear locks)
  useEffect(() => {
    if (!itemsLoading && hasItems) {
      setLocked({})
      generate({})
    }
  }, [occasion]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleLock(category: ItemCategory) {
    setLocked((prev) => {
      const next = { ...prev }
      const item = getSlotItem(category)
      if (category in prev) {
        delete next[category]
      } else if (item) {
        next[category] = item
      }
      return next
    })
  }

  function getSlotItem(category: ItemCategory): Item | null {
    if (!outfit) return null
    return outfit[category as keyof GeneratedOutfit] as Item | null
  }

  function handleSwap(category: ItemCategory, item: Item) {
    if (!outfit) return
    setOutfit({ ...outfit, [category]: item })
    // Also lock the swapped slot so it persists on next regeneration
    setLocked((prev) => ({ ...prev, [category]: item }))
  }

  const suggestedName = outfit ? autoName(occasion) : ''

  async function handleSave(name: string) {
    if (!outfit) return
    setSaving(true)
    const { error } = await saveOutfit(outfitItemIds(outfit), name, occasion)
    setSaving(false)
    if (error) {
      showToast("Totally buggin' — couldn't save outfit", 'error')
    } else {
      setSaveOpen(false)
      showToast('Outfit saved! 💾', 'success')
    }
  }

  async function handleWearToday() {
    if (!outfit) return
    setWearingToday(true)
    const itemIds = outfitItemIds(outfit)
    const name = autoName(occasion)

    const { data: saved, error: saveErr } = await saveOutfit(itemIds, name, occasion)
    if (saveErr || !saved) {
      showToast("Totally buggin' — couldn't save outfit", 'error')
      setWearingToday(false)
      return
    }

    const { error: calErr } = await addToCalendar(saved.id, TODAY_ISO, 'worn')
    if (calErr) {
      showToast("Saved outfit but couldn't add to calendar", 'info')
    }

    // Increment wear counts (best-effort)
    await Promise.all(itemIds.map((id) => incrementWearCount(id)))

    setWearingToday(false)
    showToast('Marked as worn today! 📅', 'success')
  }

  // Slots to render in order (only show non-null slots)
  const slots = outfit
    ? (outfit.path === 'dress' ? DRESS_SLOTS : TOPS_SLOTS).filter(
        (cat) => getSlotItem(cat) !== null,
      )
    : []

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        left={
          <IconButton label="Open calendar" onClick={() => navigate('/calendar')}>
            <CalendarIcon />
          </IconButton>
        }
        right={
          <IconButton label="Dionne mode" onClick={() => {}}>
            <SparkleIcon />
          </IconButton>
        }
      />

      <div className="page-content px-4 pt-2">
        {/* Greeting */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-text-primary leading-tight">
            Hey, {firstName} ✌️
          </h1>
          <p className="text-sm text-text-tertiary mt-0.5">{TODAY}</p>
        </div>

        {/* Occasion filter chips */}
        <div className="-mx-4 px-4 mb-4 overflow-x-auto">
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            {OCCASION_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setOccasion(value)}
                className={`
                  px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap
                  transition-all duration-150 active:scale-95 select-none
                  ${occasion === value ? 'bg-accent-yellow text-text-primary' : 'bg-neutral-100 text-text-secondary'}
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── OUTFIT CARD ── */}
        {itemsLoading ? (
          <Card padding="none" className="mb-4 overflow-hidden">
            <div className="p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-neutral-100 last:border-0">
                  <div className="w-14 h-14 rounded-xl bg-neutral-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-neutral-100 rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-neutral-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : !hasItems ? (
          <Card padding="none" className="mb-4 overflow-hidden">
            <div className="bg-gradient-to-b from-accent-yellow-light/60 to-accent-pink/10 px-5 pt-5 pb-6">
              <EmptyState
                emoji="👗"
                title="Add your first outfit pieces"
                description="Add a top (or dress) and a pair of shoes, and I'll start generating looks."
                action={{
                  label: 'Go to my closet',
                  onClick: () => navigate('/closet'),
                }}
                className="py-4"
              />
            </div>
          </Card>
        ) : (
          <Card
            padding="none"
            className={`mb-4 overflow-hidden transition-opacity duration-200 ${generating ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                {occasion} look
              </p>
              {Object.keys(locked).length > 0 && (
                <button
                  onClick={() => setLocked({})}
                  className="text-2xs font-semibold text-text-tertiary underline underline-offset-2 active:opacity-60"
                >
                  Unlock all
                </button>
              )}
            </div>

            {/* Slots */}
            {outfit && slots.map((cat, i) => {
              const item = getSlotItem(cat)!
              return (
                <OutfitSlotRow
                  key={cat}
                  category={cat}
                  item={item}
                  locked={cat in locked}
                  onLockToggle={() => toggleLock(cat)}
                  onTap={() => setSwapCategory(cat)}
                  isLast={i === slots.length - 1}
                />
              )
            })}
          </Card>
        )}

        {/* Action row */}
        {hasItems && (
          <>
            <div className="flex gap-3 mb-3">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                loading={generating}
                onClick={() => generate()}
              >
                As if! 🙄
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                disabled={!outfit || generating}
                onClick={() => setSaveOpen(true)}
              >
                Save look 💾
              </Button>
            </div>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              loading={wearingToday}
              disabled={!outfit || generating}
              onClick={handleWearToday}
              className="mb-6 bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Wear today ✓
            </Button>
          </>
        )}

        {/* Dionne mode banner */}
        <Card padding="md" className="mb-8 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-yellow flex items-center justify-center flex-shrink-0 text-lg select-none">
              ✨
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Dionne Mode</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                AI outfit suggestions — Phase 6
              </p>
            </div>
            <div className="w-11 h-6 bg-neutral-700 rounded-full relative flex-shrink-0">
              <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-neutral-500 rounded-full" />
            </div>
          </div>
        </Card>
      </div>

      {/* Swap sheet */}
      <SwapSheet
        open={swapCategory !== null}
        onClose={() => setSwapCategory(null)}
        category={swapCategory}
        currentItemId={swapCategory ? getSlotItem(swapCategory)?.id ?? null : null}
        items={items}
        onSelect={(item) => { if (swapCategory) handleSwap(swapCategory, item) }}
      />

      {/* Save outfit sheet */}
      <SaveOutfitSheet
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        suggestedName={suggestedName}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="16" height="16" rx="3" />
      <path d="M16 2v4M6 2v4M3 10h16" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2l2.09 6.26L20 11l-6.91 2.74L11 20l-2.09-6.26L2 11l6.91-2.74z" />
    </svg>
  )
}
