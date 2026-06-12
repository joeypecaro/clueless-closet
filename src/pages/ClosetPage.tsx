import { useState } from 'react'
import PageHeader, { IconButton } from '../components/layout/PageHeader'
import SegmentedControl from '../components/ui/SegmentedControl'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'

type CategoryTab = 'all' | 'top' | 'bottom' | 'dress' | 'shoes' | 'purse' | 'accessory'
type ClosetView = 'closet' | 'wishlist'

const categoryOptions: Array<{ value: CategoryTab; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'top', label: 'Tops' },
  { value: 'bottom', label: 'Bottoms' },
  { value: 'dress', label: 'Dresses' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'purse', label: 'Purses' },
  { value: 'accessory', label: 'Accessories' },
]

export default function ClosetPage() {
  const [category, setCategory] = useState<CategoryTab>('all')
  const [view, setView] = useState<ClosetView>('closet')

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Your Closet"
        right={
          <IconButton label="Sort" onClick={() => {}}>
            <SortIcon />
          </IconButton>
        }
      />

      <div className="flex flex-col flex-1 min-h-0">
        {/* Closet / Wishlist toggle */}
        <div className="px-4 pt-3 pb-2 flex-shrink-0">
          <div className="flex bg-neutral-100 rounded-2xl p-1">
            {(['closet', 'wishlist'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`
                  flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 select-none
                  ${view === v
                    ? 'bg-white shadow-card text-text-primary'
                    : 'text-text-secondary'
                  }
                `}
              >
                {v === 'closet' ? '👗 Closet' : '✨ Wishlist'}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter — horizontal scroll */}
        <div className="px-4 pb-3 flex-shrink-0 overflow-x-auto">
          <SegmentedControl
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />
        </div>

        {/* Item grid — scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
          <EmptyState
            emoji={view === 'closet' ? '👗' : '🛍️'}
            title={view === 'closet' ? 'Your closet is empty' : 'No wishlist items yet'}
            description={
              view === 'closet'
                ? 'Tap the + button to start building your digital wardrobe.'
                : 'Save items you love while you shop and track what you want.'
            }
            className="mt-8"
          />
        </div>
      </div>

      {/* Floating action button */}
      <button
        aria-label="Add item"
        className="
          fixed bottom-0 right-0 z-30
          w-14 h-14 rounded-full
          bg-accent-yellow text-text-primary
          shadow-card-raised
          flex items-center justify-center text-2xl
          transition-all duration-150 active:scale-90
          select-none
        "
        style={{
          marginBottom: 'calc(68px + env(safe-area-inset-bottom) + 16px)',
          marginRight: 'max(16px, calc((100vw - 430px) / 2 + 16px))',
        }}
        onClick={() => {}}
      >
        <PlusIcon />
      </button>
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

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
