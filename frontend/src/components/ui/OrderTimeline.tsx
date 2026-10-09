/**
 * OrderTimeline component
 *
 * Displays the order status timeline.
 */

import type { Order } from '@/types'

interface OrderTimelineProps {
  order: Order
}

const statusConfig = {
  pending: {
    label: 'Kutilmoqda',
    color: 'bg-gray-100 text-gray-700',
    icon: '⏳',
  },
  confirmed: {
    label: 'Tasdiqlangan',
    color: 'bg-yellow-100 text-yellow-700',
    icon: '✅',
  },
  delivering: {
    label: 'Yetkazilmoqda',
    color: 'bg-blue-100 text-blue-700',
    icon: '🚚',
  },
  completed: {
    label: 'Tugallangan',
    color: 'bg-green-100 text-green-700',
    icon: '✅',
  },
  cancelled: {
    label: 'Bekor qilingan',
    color: 'bg-red-100 text-red-700',
    icon: '❌',
  },
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const status = order.status

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  const config = getStatusConfig(status)

  // Generate timeline steps
  const steps = [
    { key: 'pending', label: 'Kutilmoqda', date: order.created_at },
    { key: 'confirmed', label: 'Tasdiqlangan', date: (order as any).status_history?.find((h: any) => h.status === 'confirmed')?.created_at },
    { key: 'delivering', label: 'Yetkazilmoqda', date: (order as any).status_history?.find((h: any) => h.status === 'delivering')?.created_at },
    { key: 'completed', label: 'Tugallangan', date: (order as any).status_history?.find((h: any) => h.status === 'completed')?.created_at },
  ]

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-border" />

      <div className="relative space-y-0">
        {steps.map((step) => {
          const isPast = statusConfig[step.key as keyof typeof statusConfig].color !== config.color
          const isCurrent = step.key === status
          const statusConfigItem = getStatusConfig(step.key)

          return (
            <div key={step.key} className="relative flex items-start gap-4">
              {/* Timeline Dot */}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                  isCurrent
                    ? 'border-primary bg-primary text-white'
                    : isPast
                    ? statusConfigItem.color
                    : 'border-border bg-white text-text-muted'
                }`}
              >
                {isCurrent ? (
                  <span className="animate-spin">⚙️</span>
                ) : (
                  statusConfigItem.icon
                )}
              </div>

              {/* Timeline Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${isCurrent ? 'text-text' : 'text-text-muted'}`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary bg-opacity-10 text-primary">
                      Joriy
                    </span>
                  )}
                </div>
                {step.date && (
                  <p className="text-xs text-text-muted mt-1">
                    {new Date(step.date).toLocaleString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrderTimeline
