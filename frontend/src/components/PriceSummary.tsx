/**
 * PriceSummary — Reusable price breakdown component
 *
 * Displays:
 * - Subtotal (items)
 * - Delivery cost
 * - Optional discount
 * - Total (bold, prominent)
 *
 * Reusable in: Cart, Checkout, Order Details, Order Confirmation
 *
 * Phase 3A: UI only
 */
interface PriceSummaryProps {
  itemsCount: number
  subtotal: number
  deliveryCost: number
  discount?: number
  total: number
  className?: string
}

export function PriceSummary({
  itemsCount,
  subtotal,
  deliveryCost,
  discount,
  total,
  className = '',
}: PriceSummaryProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-text-muted">
          Товары ({itemsCount})
        </span>
        <span className="font-semibold text-text">
          {subtotal.toLocaleString()} сум
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-text-muted">Доставка</span>
        <span className="font-semibold text-text">
          {deliveryCost === 0
            ? 'Бесплатно'
            : `${deliveryCost.toLocaleString()} сум`}
        </span>
      </div>

      {discount !== undefined && discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Скидка</span>
          <span className="font-semibold text-success">
            -{discount.toLocaleString()} сум
          </span>
        </div>
      )}

      <div className="flex justify-between border-t border-border pt-2">
        <span className="text-base font-bold text-text">Итого</span>
        <span className="text-lg font-bold text-primary">
          {total.toLocaleString()} сум
        </span>
      </div>
    </div>
  )
}
