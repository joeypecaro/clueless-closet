import { useState } from 'react'
import PageHeader, { IconButton } from '../components/layout/PageHeader'
import { ChipGroup } from '../components/ui/Chip'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Sheet from '../components/ui/Sheet'

const occasionOptions = [
  { value: 'everyday', label: 'Everyday' },
  { value: 'school', label: 'School' },
  { value: 'work', label: 'Work' },
  { value: 'date', label: 'Date' },
  { value: 'party', label: 'Party' },
]

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

export default function HomePage() {
  const [occasion, setOccasion] = useState('everyday')
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        left={
          <IconButton label="Open calendar" onClick={() => {}}>
            <CalendarIcon />
          </IconButton>
        }
        right={
          <IconButton label="Settings" onClick={() => {}}>
            <SparkleIcon />
          </IconButton>
        }
      />

      <div className="page-content px-4 pt-2">
        {/* Greeting */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-text-primary leading-tight">
            Hey there ✌️
          </h1>
          <p className="text-sm text-text-tertiary mt-0.5">{today}</p>
        </div>

        {/* Occasion filter chips */}
        <div className="-mx-4 px-4 mb-5 overflow-x-auto">
          <ChipGroup
            options={occasionOptions}
            value={occasion}
            onChange={setOccasion}
            className="flex-nowrap pb-0.5"
          />
        </div>

        {/* Outfit card placeholder */}
        <Card padding="none" className="mb-4 overflow-hidden">
          <div className="bg-gradient-to-b from-accent-yellow-light to-accent-pink/20 px-5 pt-5 pb-4">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Today's Look
            </p>
            <EmptyState
              emoji="👗"
              title="Add items to your closet"
              description="Once you've added a top, bottom, and shoes, I'll put together a look for you."
              action={{ label: 'Add your first item', onClick: () => {} }}
              className="py-8"
            />
          </div>
        </Card>

        {/* Action row */}
        <div className="flex gap-3 mb-6">
          <Button variant="secondary" size="md" fullWidth onClick={() => setSheetOpen(true)}>
            As if! 🙄
          </Button>
          <Button variant="primary" size="md" fullWidth disabled>
            Save look
          </Button>
        </div>

        {/* Dionne mode teaser */}
        <Card padding="md" className="mb-6 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-yellow flex items-center justify-center flex-shrink-0 text-lg">
              ✨
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Dionne Mode</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                AI-powered outfit suggestions — coming soon
              </p>
            </div>
            <div className="ml-auto">
              <div className="w-11 h-6 bg-neutral-700 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-neutral-500 rounded-full" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Demo: bottom sheet */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Regenerate look">
        <div className="px-5 pb-6">
          <p className="text-sm text-text-secondary mb-5">
            Add some clothes to your closet and I'll remix a fresh outfit for you.
          </p>
          <Button variant="primary" fullWidth onClick={() => setSheetOpen(false)}>
            Got it
          </Button>
        </div>
      </Sheet>
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
