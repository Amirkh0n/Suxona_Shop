/**
 * AppLayout — primary layout with a fixed bottom navigation bar.
 *
 * Used on all public and main authenticated screens (Home, Search, Stores,
 * Cart, Orders, Profile, product detail, store detail).
 *
 * The bottom nav stays visible at all times within this layout (Req 7.1, 7.2).
 * It is absent from AuthLayout (login/register/checkout) and SellerLayout.
 *
 * Bottom nav tabs (Req 7.4):
 *   Home / Search / Cart / Stores / Profile
 */
import { Outlet, NavLink } from 'react-router-dom'
import { Home, Search, ShoppingCart, Store, User } from 'lucide-react'
import { ROUTES } from '@/routes/paths'

interface NavTab {
  to: string
  icon: React.ElementType
  label: string
}

const NAV_TABS: NavTab[] = [
  { to: ROUTES.home,    icon: Home,         label: 'Home' },
  { to: ROUTES.search,  icon: Search,       label: 'Search' },
  { to: ROUTES.cart,    icon: ShoppingCart, label: 'Cart' },
  { to: ROUTES.stores,  icon: Store,        label: 'Stores' },
  { to: ROUTES.profile, icon: User,         label: 'Profile' },
]

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-svh bg-background">
      {/* Page content scrolls above the fixed bottom bar */}
      <main className="flex-1 pb-16">
        <Outlet />
      </main>

      {/* Fixed bottom navigation (height 64px per design system) */}
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border bg-background"
        style={{ maxWidth: '1280px', margin: '0 auto' }}
      >
        <ul className="flex h-full items-center justify-around">
          {NAV_TABS.map(({ to, icon: Icon, label }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === ROUTES.home}
                className={({ isActive }) =>
                  [
                    'flex flex-col items-center justify-center gap-0.5 py-2 w-full',
                    'min-h-[44px] text-xs transition-colors duration-150',
                    isActive
                      ? 'text-primary'
                      : 'text-text-muted hover:text-text',
                  ].join(' ')
                }
                aria-label={label}
              >
                <Icon size={22} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
