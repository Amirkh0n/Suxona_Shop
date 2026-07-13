/**
 * SellerLayout — layout for the seller dashboard area.
 *
 * No bottom navigation (seller navigation is in-dashboard, Phase 3).
 * SellerRoute guard wraps the pages within this layout, so all children
 * already require auth + active store by the time they render.
 *
 * Phase 3 will add a seller-specific header / side nav inside this layout.
 */
import { Outlet } from 'react-router-dom'

export function SellerLayout() {
  return (
    <div className="flex flex-col min-h-svh bg-surface">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
