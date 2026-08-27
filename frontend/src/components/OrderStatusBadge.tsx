/**
 * OrderStatusBadge — Reusable order status indicator
 *
 * Displays order status with appropriate color and icon:
 * - PENDING: Yellow
 * - ACCEPTED: Blue
 * - DELIVERING: Purple
 * - COMPLETED: Green
 * - CANCELLED: Gray
 * - REJECTED: Red
 *
 * Reusable in: Orders List, Order Details, Seller Orders
 *
 * Phase 3A: UI only
 */
import {
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  AlertCircle,
} from 'lucide-react'

type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Ожидание',
    color: 'bg-warning/10 text-warning border-warning/20',
    icon: Clock,
  },
  ACCEPTED: {
    label: 'Принят',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    icon: CheckCircle,
  },
  DELIVERING: {
    label: 'Доставляется',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    icon: Truck,
  },
  COMPLETED: {
    label: 'Завершен',
    color: 'bg-success/10 text-success border-success/20',
    icon: Package,
  },
  CANCELLED: {
    label: 'Отменен',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: XCircle,
  },
  REJECTED: {
    label: 'Отклонен',
    color: 'bg-error/10 text-error border-error/20',
    icon: AlertCircle,
  },
} as const

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.color} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </div>
  )
}
