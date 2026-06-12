import { NavLink, useLocation } from 'react-router-dom'

const tabs = [
  {
    to: '/home',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: '/closet',
    label: 'Closet',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
      </svg>
    ),
  },
]

export default function TabBar() {
  const location = useLocation()

  return (
    <nav className="tab-bar">
      <div className="flex items-stretch h-[52px]">
        {tabs.map(({ to, label, icon }) => {
          const active = location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center justify-center flex-1 gap-0.5 min-h-touch select-none"
            >
              <span className={active ? 'text-accent-yellow' : 'text-neutral-400'}>
                {icon(active)}
              </span>
              <span className={`text-2xs font-medium leading-none transition-colors ${active ? 'text-accent-yellow' : 'text-neutral-400'}`}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
