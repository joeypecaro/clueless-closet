import PageHeader, { IconButton } from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Profile"
        right={
          <IconButton label="Settings" onClick={() => {}}>
            <GearIcon />
          </IconButton>
        }
      />

      <div className="page-content px-4 pt-4">
        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-8">
          <button
            aria-label="Change profile photo"
            className="relative w-24 h-24 rounded-full mb-3 active:opacity-80 transition-opacity"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-yellow to-accent-pink-dark flex items-center justify-center text-4xl select-none">
              👤
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white shadow-card flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#1C1C1E" strokeWidth={1.8} strokeLinecap="round">
                <path d="M9.5 2.5l2 2-7 7-2.5.5.5-2.5 7-7z" />
              </svg>
            </div>
          </button>
          <h2 className="text-xl font-bold text-text-primary">Your Name</h2>
          <p className="text-sm text-text-tertiary mt-0.5">
            Sign in to save your closet — coming in Phase 2
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { value: '0', label: 'Items' },
            { value: '0', label: 'Outfits' },
            { value: '—', label: 'Most worn' },
          ].map(({ value, label }) => (
            <Card key={label} padding="md" className="text-center">
              <p className="text-2xl font-bold text-text-primary">{value}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{label}</p>
            </Card>
          ))}
        </div>

        {/* Style preferences */}
        <Card padding="md" className="mb-3">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
            Style Preferences
          </p>
          <div className="space-y-3">
            {[
              { label: 'Sizes', value: 'Not set' },
              { label: 'Favorite colors', value: 'Not set' },
              { label: 'Styles to avoid', value: 'Not set' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-text-primary">{label}</span>
                <span className="text-sm text-text-tertiary">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Settings */}
        <Card padding="none" className="mb-6 divide-y divide-neutral-100">
          {[
            { icon: '✨', label: 'Dionne Mode', sublabel: 'AI outfit suggestions', toggle: true },
            { icon: '🔔', label: 'Notifications', sublabel: 'Outfit reminders' },
            { icon: '🔒', label: 'Privacy', sublabel: 'Data & account' },
          ].map(({ icon, label, sublabel, toggle }) => (
            <button
              key={label}
              className="flex items-center gap-3 px-4 py-3.5 w-full text-left active:bg-neutral-50 transition-colors"
            >
              <span className="text-xl flex-shrink-0 w-8 text-center">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{sublabel}</p>
              </div>
              {toggle ? (
                <div className="w-11 h-6 bg-neutral-200 rounded-full flex-shrink-0" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#AEAEB2" strokeWidth={2} strokeLinecap="round">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              )}
            </button>
          ))}
        </Card>

        {/* Sign out */}
        <Button variant="secondary" fullWidth size="lg" disabled>
          Sign in to get started
        </Button>
      </div>
    </div>
  )
}

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 1.5v2M10 16.5v2M3.22 3.22l1.42 1.42M15.36 15.36l1.42 1.42M1.5 10h2M16.5 10h2M3.22 16.78l1.42-1.42M15.36 4.64l1.42-1.42" />
    </svg>
  )
}
