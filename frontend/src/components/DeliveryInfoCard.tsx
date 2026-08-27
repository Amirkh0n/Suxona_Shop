/**
 * DeliveryInfoCard — Reusable delivery information display
 *
 * Displays:
 * - Delivery method (with icon)
 * - Estimated delivery date/time
 * - Delivery cost
 * - Tracking information (optional)
 *
 * Reusable in: Order Details, Order Confirmation, Checkout Review
 *
 * Phase 3A: UI only
 */
import { Truck, Store, Clock } from 'lucide-react'

interface DeliveryInfoCardProps {
  method: 'delivery' | 'pickup'
  estimatedDate?: string
  cost: number
  trackingNumber?: string
  className?: string
}

export function DeliveryInfoCard({
  method,
  estimatedDate,
  cost,
  trackingNumber,
  className = '',
}: DeliveryInfoCardProps) {
  const isDelivery = method === 'delivery'

  return (
    <div className={`rounded-xl border border-border bg-white p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
          {isDelivery ? (
            <Truck className="h-6 w-6 text-primary" />
          ) : (
            <Store className="h-6 w-6 text-primary" />
          )}
        </div>

        <div className="flex-1">
          <p className="font-semibold text-text">
            {isDelivery ? 'Доставка курьером' : 'Самовывоз'}
          </p>

          {estimatedDate && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-text-muted">
              <Clock className="h-4 w-4" />
              <span>{estimatedDate}</span>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-text-muted">Стоимость:</span>
            <span className="font-bold text-primary">
              {cost === 0 ? 'Бесплатно' : `${cost.toLocaleString()} сум`}
            </span>
          </div>

          {trackingNumber && (
            <div className="mt-2 rounded-lg bg-surface p-2">
              <p className="text-xs text-text-muted">Трек-номер:</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-text">
                {trackingNumber}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
