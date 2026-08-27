/**
 * ProductGrid — reusable responsive product grid wrapper.
 *
 * Used on: Home, Search, Product List, Store Detail pages.
 *
 * Requirements (Design System):
 * - Mobile: 2-column grid
 * - Tablet: 3-column grid
 * - Desktop: 4-column grid
 * - Proper spacing (12px gap)
 *
 * Phase 3A: UI only.
 */
import type { ReactNode } from 'react'

export interface ProductGridProps {
  children: ReactNode
}

export function ProductGrid({ children }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  )
}
