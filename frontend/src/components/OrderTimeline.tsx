/**
 * OrderTimeline — Reusable order status timeline
 *
 * Displays order progress through statuses:
 * PENDING → ACCEPTED → DELIVERING → COMPLETED
 * (or CANCELLED/REJECTED as alternate endings)
 *
 * Reusable in: Order Details, Seller Order Details
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

interface TimelineStep {
  status: OrderStatus
  label: string
  timestamp?: string
  isActive: boolean
  isCompleted: boolean
}

interface OrderTimelineProps {
  currentStatus: OrderStatus
  timestamps?: {
    pending?: string
    accepted?: string
    delivering?: string
    completed?: string
    cancelled?: string
    rejected?: string
  }
}

const STATUS_ICONS = {
  PENDING: Clock,
  ACCEPTED: CheckCircle,
  DELIVERING: Truck,
  COMPLETED: Package,
  CANCELLED: XCircle,
  REJECTED: AlertCircle,
} as const

const STATUS_LABELS = {
  PENDING: 'Ожидание подтверждения',
  ACCEPTED: 'Заказ принят',
  DELIVERING: 'В пути',
  COMPLETED: 'Доставлено',
  CANCELLED: 'Отменено',
  REJECTED: 'Отклонено',
} as const

export function OrderTimeline({ currentStatus, timestamps = {} }: OrderTimelineProps) {
  // Determine timeline based on current status
  const isNegativeEnding = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED'

  const getSteps = (): TimelineStep[] => {
    if (isNegativeEnding) {
      // Show path to cancellation/rejection
      return [
        {
          status: 'PENDING',
          label: STATUS_LABELS.PENDING,
          timestamp: timestamps.pending,
          isActive: false,
          isCompleted: true,
        },
        {
          status: currentStatus,
          label: STATUS_LABELS[currentStatus],
          timestamp:
            timestamps[currentStatus.toLowerCase() as keyof typeof timestamps],
          isActive: true,
          isCompleted: true,
        },
      ]
    }

    // Normal flow: PENDING → ACCEPTED → DELIVERING → COMPLETED
    const normalSteps: Array<OrderStatus> = [
      'PENDING',
      'ACCEPTED',
      'DELIVERING',
      'COMPLETED',
    ]

    return normalSteps.map((status, index) => {
      const statusIndex = normalSteps.indexOf(currentStatus)
      return {
        status,
        label: STATUS_LABELS[status],
        timestamp: timestamps[status.toLowerCase() as keyof typeof timestamps],
        isActive: status === currentStatus,
        isCompleted: index <= statusIndex,
      }
    })
  }

  const steps = getSteps()

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const Icon = STATUS_ICONS[step.status]
        const isLast = index === steps.length - 1

        return (
          <div key={step.status} className="relative flex gap-3 pb-8 last:pb-0">
            {/* Timeline Line */}
            {!isLast && (
              <div
                className={`absolute left-5 top-12 h-full w-0.5 ${
                  step.isCompleted ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}

            {/* Icon Circle */}
            <div
              className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                step.isCompleted
                  ? 'bg-primary text-white'
                  : 'border-2 border-border bg-white text-text-muted'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <p
                className={`font-semibold ${
                  step.isActive ? 'text-text' : 'text-text-muted'
                }`}
              >
                {step.label}
              </p>
              {step.timestamp && (
                <p className="mt-1 text-sm text-text-muted">{step.timestamp}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
