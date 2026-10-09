/**
 * Empty State component
 *
 * Displays when content is not available with a friendly message and action.
 */

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon
  /** Title of the empty state */
  title: string
  /** Description of the empty state */
  description?: string
  /** Action button to display */
  action?: {
    label: string
    onClick: () => void
  }
  /** Additional CSS classes */
  className?: string
  /** Whether to show avatar placeholder */
  showAvatar?: boolean
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  showAvatar = true,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {showAvatar && Icon && (
        <div className="mb-4 rounded-full bg-surface p-4">
          <Icon className="h-12 w-12 text-text-muted" aria-hidden="true" />
        </div>
      )}

      {title && (
        <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      )}

      {description && (
        <p className="text-sm text-text-muted max-w-sm mb-4">{description}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

/**
 * EmptyState for Cart
 */
import { ShoppingCart } from 'lucide-react'
export function EmptyCart({ onContinue }: { onContinue: () => void }) {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="Savat bo'sh"
      description="Savatda hozircha mahsulot yo'q"
      action={{ label: 'Mahsulotlarni ko‘rish', onClick: onContinue }}
    />
  )
}

/**
 * EmptyState for Orders
 */
import { ShoppingBag } from 'lucide-react'
export function EmptyOrders({ onBrowse }: { onBrowse: () => void }) {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Buyurtmalar yo'q"
      description="Hozircha buyurtmalaringiz yo'q"
      action={{ label: 'Mahsulotlarni ko‘rish', onClick: onBrowse }}
    />
  )
}

/**
 * EmptyState for Products
 */
import { Package } from 'lucide-react'
export function EmptyProducts({ onBrowse }: { onBrowse: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="Mahsulotlar yo'q"
      description="Mavjud mahsulotlar yo'q"
      action={{ label: 'Bosh sahifaga qaytish', onClick: onBrowse }}
    />
  )
}

/**
 * EmptyState for Stores
 */
import { Store } from 'lucide-react'
export function EmptyStores({ onBrowse }: { onBrowse: () => void }) {
  return (
    <EmptyState
      icon={Store}
      title="Do'konlar yo'q"
      description="Mavjud do'konlar yo'q"
      action={{ label: 'Bosh sahifaga qaytish', onClick: onBrowse }}
    />
  )
}

/**
 * EmptyState for Addresses
 */
import { MapPin } from 'lucide-react'
export function EmptyAddresses({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={MapPin}
      title="Manzillar yo'q"
      description="Yakuniy manzilingiz yo'q"
      action={{ label: 'Yangi manzil qo‘shish', onClick: onAdd }}
    />
  )
}
