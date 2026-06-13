import { useEffect, useRef, useState } from 'react'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'
import { ChipGroup } from '../ui/Chip'
import type { Item, ItemCategory } from '../../types/database'
import type { NewItemData } from '../../hooks/useItems'
import { getItemPhotoUrl } from '../../hooks/useItems'
import {
  CATEGORY_META,
  COLOR_OPTIONS,
  STYLE_TAG_OPTIONS,
  SEASON_OPTIONS,
  OCCASION_OPTIONS,
} from '../../lib/constants'

interface ItemFormSheetProps {
  open: boolean
  onClose: () => void
  onSave: (data: NewItemData, photoFile: File | null) => Promise<void>
  mode: 'add' | 'edit'
  initialItem?: Item
  saving?: boolean
}

const EMPTY_FORM: NewItemData = {
  category: 'top',
  name: '',
  colors: [],
  style_tags: [],
  seasons: [],
  occasions: [],
  brand: '',
  is_wishlist: false,
  wishlist_link: '',
}

export default function ItemFormSheet({
  open,
  onClose,
  onSave,
  mode,
  initialItem,
  saving = false,
}: ItemFormSheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<0 | 1>(mode === 'edit' ? 1 : 0)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [form, setForm] = useState<NewItemData>(EMPTY_FORM)

  // Populate form when editing
  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initialItem) {
      setForm({
        category: initialItem.category,
        name: initialItem.name,
        colors: initialItem.colors,
        style_tags: initialItem.style_tags,
        seasons: initialItem.seasons,
        occasions: initialItem.occasions,
        brand: initialItem.brand ?? '',
        is_wishlist: initialItem.is_wishlist,
        wishlist_link: initialItem.wishlist_link ?? '',
      })
      setStep(1)
    } else {
      setForm(EMPTY_FORM)
      setPhotoFile(null)
      setPhotoPreview(null)
      setStep(0)
    }
  }, [open, mode, initialItem])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setStep(1)
    e.target.value = ''
  }

  function setField<K extends keyof NewItemData>(key: K, value: NewItemData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleArrayField(key: 'colors' | 'style_tags' | 'seasons' | 'occasions', value: string) {
    setForm((prev) => {
      const arr = prev[key] as string[]
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  async function handleSave() {
    if (!form.name.trim()) return
    await onSave({ ...form, name: form.name.trim() }, photoFile)
  }

  const canProceed = mode === 'edit' || (photoFile !== null)
  const canSave = form.name.trim().length > 0 && form.category !== ('' as ItemCategory)

  const existingPhotoUrl =
    mode === 'edit' && initialItem ? getItemPhotoUrl(initialItem.photo_url) : null

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={mode === 'add' ? 'Add item' : 'Edit item'}
      snapPoints="full"
    >
      <div className="flex flex-col h-full">
        {/* Single hidden file input, always mounted so ref is always valid */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoChange}
        />

        {/* Step indicator (add mode only) */}
        {mode === 'add' && (
          <div className="flex gap-1.5 px-5 pb-3 flex-shrink-0">
            {([0, 1] as const).map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors duration-200 ${step >= s ? 'bg-accent-yellow' : 'bg-neutral-200'}`}
              />
            ))}
          </div>
        )}

        {/* ── STEP 0: Photo ── */}
        {step === 0 && (
          <div className="flex flex-col flex-1 px-5 pb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-neutral-200 bg-neutral-50 active:bg-neutral-100 transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent-yellow/20 flex items-center justify-center text-3xl">
                📸
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-text-primary">Take a photo or choose one</p>
                <p className="text-xs text-text-tertiary mt-1 max-w-[220px]">
                  Lay the item flat on a plain background for the best look.
                </p>
              </div>
            </button>
            <p className="text-center text-xs text-text-tertiary mt-4">
              Already added?{' '}
              <button
                className="font-semibold text-text-primary underline underline-offset-2"
                onClick={() => setStep(1)}
              >
                Skip photo
              </button>
            </p>
          </div>
        )}

        {/* ── STEP 1: Details ── */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Photo preview strip */}
            <div className="px-5 pb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                {(photoPreview ?? existingPhotoUrl) ? (
                  <img
                    src={(photoPreview ?? existingPhotoUrl)!}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center text-2xl flex-shrink-0">
                    📸
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {mode === 'add' && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm font-medium text-text-secondary underline underline-offset-2"
                    >
                      {photoPreview ? 'Change photo' : 'Add photo'}
                    </button>
                  )}
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {canProceed
                      ? 'Looking good ✨'
                      : 'A photo helps you remember this item'}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 pb-8 flex flex-col gap-5">
              {/* Category */}
              <div>
                <label className={sectionLabel}>Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_META.map(({ value, label, emoji }) => (
                    <button
                      key={value}
                      onClick={() => setField('category', value)}
                      className={`
                        flex flex-col items-center gap-1 py-3 rounded-2xl text-xs font-medium
                        transition-all duration-150 active:scale-95 select-none
                        ${form.category === value
                          ? 'bg-accent-yellow text-text-primary'
                          : 'bg-neutral-100 text-text-secondary'
                        }
                      `}
                    >
                      <span className="text-xl">{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className={sectionLabel}>Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Black blazer, White sneakers…"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Colors */}
              <div>
                <label className={sectionLabel}>Colors</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(({ value, hex, border }) => (
                    <button
                      key={value}
                      onClick={() => toggleArrayField('colors', value)}
                      className={`
                        w-9 h-9 rounded-full flex-shrink-0 transition-all duration-150 active:scale-90
                        ${form.colors.includes(value) ? 'ring-2 ring-offset-2 ring-accent-yellow scale-110' : ''}
                      `}
                      style={{
                        backgroundColor: hex,
                        border: border ? '1.5px solid #D1D1C8' : undefined,
                      }}
                      title={value}
                    />
                  ))}
                </div>
              </div>

              {/* Style tags */}
              <div>
                <label className={sectionLabel}>Style tags</label>
                <ChipGroup
                  options={STYLE_TAG_OPTIONS}
                  value={form.style_tags}
                  onChange={(v) => toggleArrayField('style_tags', v)}
                  multi
                />
              </div>

              {/* Seasons */}
              <div>
                <label className={sectionLabel}>Seasons</label>
                <ChipGroup
                  options={SEASON_OPTIONS}
                  value={form.seasons}
                  onChange={(v) => toggleArrayField('seasons', v)}
                  multi
                />
              </div>

              {/* Occasions */}
              <div>
                <label className={sectionLabel}>Occasions</label>
                <ChipGroup
                  options={OCCASION_OPTIONS}
                  value={form.occasions}
                  onChange={(v) => toggleArrayField('occasions', v)}
                  multi
                />
              </div>

              {/* Brand */}
              <div>
                <label className={sectionLabel}>Brand (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Zara, Levi's, thrifted…"
                  value={form.brand}
                  onChange={(e) => setField('brand', e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Wishlist toggle */}
              <div>
                <button
                  onClick={() => setField('is_wishlist', !form.is_wishlist)}
                  className="flex items-center gap-3 w-full py-1"
                >
                  <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${form.is_wishlist ? 'bg-accent-yellow' : 'bg-neutral-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-card transition-transform duration-200 ${form.is_wishlist ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-text-primary">Wishlist item</p>
                    <p className="text-xs text-text-tertiary">I want this, but don't own it yet</p>
                  </div>
                </button>

                {form.is_wishlist && (
                  <input
                    type="url"
                    placeholder="Shop link (optional)"
                    value={form.wishlist_link}
                    onChange={(e) => setField('wishlist_link', e.target.value)}
                    className={`${inputClass} mt-3`}
                  />
                )}
              </div>

              {/* Save */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={saving}
                disabled={!canSave}
                onClick={handleSave}
              >
                {mode === 'add' ? 'Add to closet ✨' : 'Save changes'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  )
}

const sectionLabel = 'block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2'
const inputClass =
  'w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-text-primary ' +
  'placeholder:text-text-tertiary min-h-[44px] ' +
  'focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-transparent ' +
  'transition-all duration-150'
