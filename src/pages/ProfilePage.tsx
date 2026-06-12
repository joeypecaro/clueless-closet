import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Sheet from '../components/ui/Sheet'
import { ChipGroup } from '../components/ui/Chip'

const COLOR_OPTIONS = [
  { value: 'black', label: 'Black' },
  { value: 'white', label: 'White' },
  { value: 'grey', label: 'Grey' },
  { value: 'beige', label: 'Beige' },
  { value: 'navy', label: 'Navy' },
  { value: 'brown', label: 'Brown' },
  { value: 'red', label: 'Red' },
  { value: 'pink', label: 'Pink' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
]

interface Stats {
  itemCount: number
  outfitCount: number
  mostWorn: string | null
}

export default function ProfilePage() {
  const { profile, avatarUrl, updateProfile, uploadAvatar, signOut } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stats, setStats] = useState<Stats>({ itemCount: 0, outfitCount: 0, mostWorn: null })
  const [editNameOpen, setEditNameOpen] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [sizesOpen, setSizesOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [nameInput, setNameInput] = useState(profile?.display_name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const prefs = (profile?.style_preferences ?? {}) as {
    dionneModeEnabled?: boolean
    favoriteColors?: string[]
    avoid?: string
  }
  const sizes = (profile?.sizes ?? {}) as {
    top?: string; bottom?: string; dress?: string; shoe?: string
  }

  const [dionnEnabled, setDionnEnabled] = useState(prefs.dionneModeEnabled ?? false)
  const [favoriteColors, setFavoriteColors] = useState<string[]>(prefs.favoriteColors ?? [])
  const [avoidText, setAvoidText] = useState(prefs.avoid ?? '')
  const [topSize, setTopSize] = useState(sizes.top ?? '')
  const [bottomSize, setBottomSize] = useState(sizes.bottom ?? '')
  const [dressSize, setDressSize] = useState(sizes.dress ?? '')
  const [shoeSize, setShoeSize] = useState(sizes.shoe ?? '')
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [savingSizes, setSavingSizes] = useState(false)

  // Sync local state when profile loads
  useEffect(() => {
    if (!profile) return
    setNameInput(profile.display_name ?? '')
    const p = (profile.style_preferences ?? {}) as typeof prefs
    setDionnEnabled(p.dionneModeEnabled ?? false)
    setFavoriteColors(p.favoriteColors ?? [])
    setAvoidText(p.avoid ?? '')
    const s = (profile.sizes ?? {}) as typeof sizes
    setTopSize(s.top ?? '')
    setBottomSize(s.bottom ?? '')
    setDressSize(s.dress ?? '')
    setShoeSize(s.shoe ?? '')
  }, [profile]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!profile) return
    async function loadStats() {
      const [{ count: items }, { count: outfits }, { data: topItem }] = await Promise.all([
        supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('is_wishlist', false),
        supabase.from('outfits').select('*', { count: 'exact', head: true }),
        supabase
          .from('items')
          .select('name, wear_count')
          .eq('is_wishlist', false)
          .gt('wear_count', 0)
          .order('wear_count', { ascending: false })
          .limit(1),
      ])
      setStats({
        itemCount: items ?? 0,
        outfitCount: outfits ?? 0,
        mostWorn: topItem?.[0]?.name ?? null,
      })
    }
    loadStats()
  }, [profile])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setUploadingAvatar(true)
    const { error } = await uploadAvatar(file)
    setUploadingAvatar(false)
    if (error) {
      setAvatarPreview(null)
      showToast('Totally buggin\' — couldn\'t upload photo', 'error')
    } else {
      showToast('Profile photo updated ✨', 'success')
    }
    // Reset so the same file can be picked again
    e.target.value = ''
  }

  async function saveName() {
    if (!nameInput.trim()) return
    setSavingName(true)
    const { error } = await updateProfile({ display_name: nameInput.trim() })
    setSavingName(false)
    setEditNameOpen(false)
    if (error) showToast('Totally buggin\' — couldn\'t save name', 'error')
    else showToast('Name updated ✨', 'success')
  }

  async function savePrefs() {
    setSavingPrefs(true)
    const { error } = await updateProfile({
      style_preferences: {
        dionneModeEnabled: dionnEnabled,
        favoriteColors,
        avoid: avoidText,
      },
    })
    setSavingPrefs(false)
    setPrefsOpen(false)
    if (error) showToast('Totally buggin\' — couldn\'t save preferences', 'error')
    else showToast('Style preferences saved ✨', 'success')
  }

  async function saveSizes() {
    setSavingSizes(true)
    const { error } = await updateProfile({
      sizes: { top: topSize, bottom: bottomSize, dress: dressSize, shoe: shoeSize },
    })
    setSavingSizes(false)
    setSizesOpen(false)
    if (error) showToast('Totally buggin\' — couldn\'t save sizes', 'error')
    else showToast('Sizes saved ✨', 'success')
  }

  async function handleSignOut() {
    await signOut()
  }

  function toggleColor(color: string) {
    setFavoriteColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    )
  }

  const displayAvatar = avatarPreview ?? avatarUrl

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Profile" />

      <div className="page-content px-4 pt-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-3">
            <button
              aria-label="Change profile photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative w-24 h-24 rounded-full active:opacity-80 transition-opacity block"
            >
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-yellow to-accent-pink-dark flex items-center justify-center text-4xl select-none">
                  {profile?.display_name?.[0]?.toUpperCase() ?? '👤'}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <svg className="animate-spin w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" d="M12 2a10 10 0 1 0 10 10" strokeOpacity={0.3} />
                    <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                </div>
              )}
            </button>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white shadow-card flex items-center justify-center pointer-events-none">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#1C1C1E" strokeWidth={1.8} strokeLinecap="round">
                <path d="M9 2l2 2-6.5 6.5-2.5.5.5-2.5L9 2z" />
              </svg>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <button
            onClick={() => { setNameInput(profile?.display_name ?? ''); setEditNameOpen(true) }}
            className="flex items-center gap-1.5 group"
          >
            <h2 className="text-xl font-bold text-text-primary">
              {profile?.display_name || 'Add your name'}
            </h2>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#AEAEB2" strokeWidth={1.8} strokeLinecap="round" className="group-active:stroke-text-primary transition-colors">
              <path d="M9.5 2.5l2 2-7 7-2.5.5.5-2.5 7-7z" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold text-text-primary">{stats.itemCount}</p>
            <p className="text-xs text-text-tertiary mt-0.5">Items</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold text-text-primary">{stats.outfitCount}</p>
            <p className="text-xs text-text-tertiary mt-0.5">Outfits</p>
          </Card>
          <Card padding="md" className="text-center overflow-hidden">
            <p className="text-sm font-bold text-text-primary truncate">
              {stats.mostWorn ?? '—'}
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">Most worn</p>
          </Card>
        </div>

        {/* Style section */}
        <Card padding="none" className="mb-3 divide-y divide-neutral-100">
          <button
            onClick={() => setSizesOpen(true)}
            className="flex items-center justify-between px-4 py-3.5 w-full active:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl w-7 text-center">📏</span>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Sizes</p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {sizes.top || sizes.shoe
                    ? `Top ${sizes.top || '?'} · Shoe ${sizes.shoe || '?'}`
                    : 'Not set'}
                </p>
              </div>
            </div>
            <ChevronRight />
          </button>

          <button
            onClick={() => setPrefsOpen(true)}
            className="flex items-center justify-between px-4 py-3.5 w-full active:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl w-7 text-center">🎨</span>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Style preferences</p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {favoriteColors.length > 0
                    ? `${favoriteColors.length} favorite color${favoriteColors.length > 1 ? 's' : ''}`
                    : 'Tap to set your style'}
                </p>
              </div>
            </div>
            <ChevronRight />
          </button>
        </Card>

        {/* Settings */}
        <Card padding="none" className="mb-4 divide-y divide-neutral-100">
          <button
            onClick={async () => {
              const next = !dionnEnabled
              setDionnEnabled(next)
              await updateProfile({ style_preferences: { ...prefs, dionneModeEnabled: next } })
            }}
            className="flex items-center gap-3 px-4 py-3.5 w-full active:bg-neutral-50 transition-colors"
          >
            <span className="text-xl w-7 text-center">✨</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-text-primary">Dionne Mode</p>
              <p className="text-xs text-text-tertiary mt-0.5">AI outfit suggestions</p>
            </div>
            <Toggle enabled={dionnEnabled} />
          </button>
        </Card>

        {/* Account actions */}
        <div className="flex flex-col gap-3 mb-8">
          <Button variant="secondary" size="lg" fullWidth onClick={handleSignOut}>
            Sign out
          </Button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="text-sm text-error font-medium py-2 active:opacity-60 transition-opacity"
          >
            Delete account
          </button>
        </div>
      </div>

      {/* Edit name sheet */}
      <Sheet open={editNameOpen} onClose={() => setEditNameOpen(false)} title="Your name">
        <div className="px-5 pb-6 flex flex-col gap-4">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Cher Horowitz"
            autoFocus
            className={inputClass}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
          />
          <Button variant="primary" size="lg" fullWidth loading={savingName} onClick={saveName}>
            Save
          </Button>
        </div>
      </Sheet>

      {/* Sizes sheet */}
      <Sheet open={sizesOpen} onClose={() => setSizesOpen(false)} title="Your sizes">
        <div className="px-5 pb-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Top / shirt', value: topSize, set: setTopSize, placeholder: 'XS · S · M · L' },
              { label: 'Bottoms', value: bottomSize, set: setBottomSize, placeholder: '26 · 27 · 28…' },
              { label: 'Dress', value: dressSize, set: setDressSize, placeholder: 'XS · S · M · L' },
              { label: 'Shoes', value: shoeSize, set: setShoeSize, placeholder: '7 · 7.5 · 8…' },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                  {label}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
          <Button variant="primary" size="lg" fullWidth loading={savingSizes} onClick={saveSizes}>
            Save sizes
          </Button>
        </div>
      </Sheet>

      {/* Style preferences sheet */}
      <Sheet open={prefsOpen} onClose={() => setPrefsOpen(false)} title="Style preferences" snapPoints="half">
        <div className="px-5 pb-6 flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Favorite colors
            </p>
            <ChipGroup
              options={COLOR_OPTIONS}
              value={favoriteColors}
              onChange={toggleColor}
              multi
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">
              Styles / patterns to avoid
            </label>
            <input
              type="text"
              value={avoidText}
              onChange={(e) => setAvoidText(e.target.value)}
              placeholder="e.g. neon colors, animal print"
              className={inputClass}
            />
          </div>

          <Button variant="primary" size="lg" fullWidth loading={savingPrefs} onClick={savePrefs}>
            Save preferences
          </Button>
        </div>
      </Sheet>

      {/* Delete account confirm sheet */}
      <Sheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete account">
        <div className="px-5 pb-6 flex flex-col gap-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            Way harsh, Tai. This will permanently delete your closet, outfits, and all saved data.
            This cannot be undone.
          </p>
          <Button variant="destructive" size="lg" fullWidth onClick={() => {
            setDeleteOpen(false)
            showToast('Account deletion requires contacting support for now.', 'info')
          }}>
            Delete everything
          </Button>
          <Button variant="secondary" size="lg" fullWidth onClick={() => setDeleteOpen(false)}>
            Never mind
          </Button>
        </div>
      </Sheet>
    </div>
  )
}

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <div
      className={`w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 relative ${enabled ? 'bg-accent-yellow' : 'bg-neutral-200'}`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-card transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </div>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#AEAEB2" strokeWidth={2} strokeLinecap="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  )
}

const inputClass =
  'w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-text-primary ' +
  'placeholder:text-text-tertiary min-h-[44px] ' +
  'focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-transparent ' +
  'transition-all duration-150'
