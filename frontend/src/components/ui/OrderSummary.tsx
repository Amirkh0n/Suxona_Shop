/**
 * OrderSummary component
 *
 * Displays the summary of an order with pricing information.
 */

import type { Order } from '@/types'

interface OrderSummaryProps {
  order: Order
}

export function OrderSummary({ order }: OrderSummaryProps) {
  const deliveryPrice = order.delivery_price
  const subtotal = order.subtotal
  const total = order.total

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-text-muted">Summa</span>
        <span className="text-text font-medium">{subtotal}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-text-muted">Yetkazib berish</span>
        <span className="text-text font-medium">{deliveryPrice}</span>
      </div>

      <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
        <span className="text-text">Jami</span>
        <span className="text-primary">{total}</span>
      </div>
    </div>
  )
}

export default OrderSummary
