/**
 * DeliveryMethodCard — Reusable delivery method selection card
 *
 * Displays:
 * - Method icon
 * - Method name
 * - Method description
 * - Delivery cost
 * - Selected state
 *
 * Reusable in: Checkout, Order Details, Seller Order Management
 *
 * Phase 3A: UI only
 */
import { Truck, Store, Check } from 'lucide-react'
import type { ReactNode } from 'react'

interface DeliveryMethodCardProps {
  id: string
  name: string
  description: string
  cost: number
  icon: 'delivery' | 'pickup'
  isSelected?: boolean
  onSelect?: () => void
}

const ICON_MAP: Record<'delivery' | 'pickup', ReactNode> = {
  delivery: <Truck className="h-6 w-6" />,
  pickup: <Store className="h-6 w-6" />,
}

export function DeliveryMethodCard({
  name,
  description,
  cost,
  icon,
  isSelected = false,
  onSelect,
}: DeliveryMethodCardProps) {
  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-white hover:border-primary/50'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
            isSelected ? 'bg-primary text-white' : 'bg-surface text-text-muted'
          }`}
        >
          {ICON_MAP[icon]}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-text">{name}</p>
              <p className="mt-1 text-sm text-text-muted">{description}</p>
            </div>
            {isSelected && (
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          <p className="mt-2 font-bold text-primary">
            {cost === 0 ? 'Бесплатно' : `${cost.toLocaleString()} сум`}
          </p>
        </div>
      </div>
    </div>
  )
}
