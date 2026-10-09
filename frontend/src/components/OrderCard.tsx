/**
 * OrderCard component
 *
 * Displays a single order in the orders list.
 */

import { Link } from 'react-router-dom'
import type { Order, OrderStatus } from '@/types'
import { ROUTES } from '@/routes/paths'
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge'
import { OrderSummary } from '@/components/ui/OrderSummary'
import { Button } from '@/components/ui/Button'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const mutation = useMutation({
    mutationFn: async (orderId: number): Promise<void> => {
      const response = await fetch(`/api/v1/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to cancel order')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (error: Error) => {
      console.error('Failed to cancel order:', error)
    },
  })

  const isCancelled = order.status === 'CANCELLED'
  const isPending = order.status === 'PENDING'

  if (isCancelled) {
    return (
      <div className="bg-white rounded-lg border border-border p-4 opacity-75">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text">Buyurtma #{order.id}</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Bekor qilingan</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-semibold text-text">Buyurtma #{order.id}</h3>
            <OrderStatusBadge status={order.status as OrderStatus} />
          </div>
          <p className="text-sm text-text-muted">
            {new Date(order.created_at).toLocaleDateString('uz-UZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {isPending && (
          <Link to={ROUTES.orderDetail.replace(':orderId', String(order.id))} className="text-sm font-medium text-primary hover:text-primary-hover">
            Ko‘rish →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-sm">
          <p className="text-text-muted mb-1">Do‘kon</p>
          <p className="text-sm font-medium text-text">{order.store.name}</p>
        </div>

        {order.address && (
          <div className="text-sm">
            <p className="text-text-muted mb-1">Manzil</p>
            <p className="text-sm font-medium text-text line-clamp-1">
              {order.address.village.name}, {order.address.house}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3">
        <OrderSummary order={order} />
      </div>

      {isPending && (
        <div className="mt-3 pt-3 border-t border-border">
          <Button onClick={() => mutation.mutate(order.id)} variant="danger" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Bekor qilinmoqda...' : 'Bekor qilish'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default OrderCard

const queryClient = useQueryClient()
