/**
 * AuthLayout — bare layout without bottom navigation.
 *
 * Used for: Login, Register, Checkout, Order Success, Seller Onboarding.
 * The bottom nav is intentionally hidden on these screens (Req 7.3).
 */
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex flex-col min-h-svh bg-background">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
