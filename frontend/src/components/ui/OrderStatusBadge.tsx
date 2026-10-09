/**
 * OrderStatusBadge component
 *
 * Displays the status badge for orders.
 */

import type { OrderStatus } from '@/types'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const statusConfig: Record<OrderStatus, { color: string; label: string; icon: string }> = {
  PENDING: { color: 'bg-gray-100 text-gray-700', label: 'Kutilmoqda', icon: '⏳' },
  ACCEPTED: { color: 'bg-yellow-100 text-yellow-700', label: 'Tasdiqlangan', icon: '✅' },
  DELIVERING: { color: 'bg-blue-100 text-blue-700', label: 'Yetkazilmoqda', icon: '🚚' },
  COMPLETED: { color: 'bg-green-100 text-green-700', label: 'Tugallangan', icon: '✅' },
  CANCELLED: { color: 'bg-red-100 text-red-700', label: 'Bekor qilingan', icon: '❌' },
  REJECTED: { color: 'bg-gray-100 text-gray-700', label: 'Rad etilgan', icon: '❌' },
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status as OrderStatus] || statusConfig.PENDING

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}

export default OrderStatusBadge
