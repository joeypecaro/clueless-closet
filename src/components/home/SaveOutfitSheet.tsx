import { useEffect, useState } from 'react'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'

interface SaveOutfitSheetProps {
  open: boolean
  onClose: () => void
  suggestedName: string
  onSave: (name: string) => Promise<void>
  saving: boolean
}

export default function SaveOutfitSheet({
  open,
  onClose,
  suggestedName,
  onSave,
  saving,
}: SaveOutfitSheetProps) {
  const [name, setName] = useState(suggestedName)

  useEffect(() => {
    if (open) setName(suggestedName)
  }, [open, suggestedName])

  return (
    <Sheet open={open} onClose={onClose} title="Save this look">
      <div className="px-5 pb-6 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">
            Outfit name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Fab Everyday Look"
            autoFocus
            className={inputClass}
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && onSave(name.trim())}
          />
        </div>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={saving}
          disabled={!name.trim()}
          onClick={() => onSave(name.trim())}
        >
          Save look 💾
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Sheet>
  )
}

const inputClass =
  'w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-text-primary ' +
  'placeholder:text-text-tertiary min-h-[44px] ' +
  'focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-transparent ' +
  'transition-all duration-150'
