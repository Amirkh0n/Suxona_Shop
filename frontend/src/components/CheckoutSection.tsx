/**
 * CheckoutSection — Reusable section wrapper for checkout steps
 *
 * Provides consistent styling for checkout sections with:
 * - Title
 * - Optional subtitle
 * - Content area
 *
 * Reusable in: Checkout, Order Review, Order Details
 *
 * Phase 3A: UI only
 */
import type { ReactNode } from 'react'

interface CheckoutSectionProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function CheckoutSection({
  title,
  subtitle,
  children,
  className = '',
}: CheckoutSectionProps) {
  return (
    <section className={`rounded-2xl bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-text">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}
