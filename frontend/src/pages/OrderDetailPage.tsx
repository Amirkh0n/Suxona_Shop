/**
 * OrderDetailPage - Order detail page with real API integration
 *
 * Features:
 * - Real API integration for order details
 * - Order status timeline
 * - Order items list
 * - Order summary
 * - Customer address display
 * - Loading states
 * - Error handling
 * - Cancel order functionality
 */

import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import { useOrderDetail, useCancelOrder } from '@/features/orders/useOrders'
import { OrderSummary } from '@/components/ui/OrderSummary'
import { OrderTimeline } from '@/components/ui/OrderTimeline'
import type { OrderItem } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()

  const { order, isLoading, error, refetch } = useOrderDetail(Number(orderId))
  const { mutate: cancelOrder, isPending: isCanceling } = useCancelOrder()

  useEffect(() => {
    refetch()
  }, [orderId, refetch])

  const handleCancelOrder = async () => {
    if (!confirm('Buyurtmangizni bekor qilmoqchimisiz? Bu amal bekor qilinmaydi.')) {
      return
    }

    try {
      await cancelOrder(Number(orderId))
      refetch()
    } catch (error) {
      console.error('Failed to cancel order:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton width="200px" height="2rem" />
          <Skeleton width="100%" height="3rem" className="mt-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <Skeleton width="100%" height="400px" />
            </div>
            <div className="space-y-4">
              <Skeleton width="100%" height="2rem" />
              <Skeleton width="70%" height="2rem" />
              <Skeleton width="60%" height="1rem" />
              <Skeleton width="100%" height="3rem" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <EmptyState title="Buyurtma topilmadi" description="Iltimos, keyinroq qayta urinib ko‘ring" />
  }

  if (!order) {
    return <EmptyState title="Buyurtma topilmadi" description="Iltimos, keyinroq qayta urinib ko‘ring" />
  }

  if (order.status === 'CANCELLED') {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-text mb-2">Buyurtma bekor qilingan</h2>
              <p className="text-text-muted mb-6">Buyurtma #{order.id} bekor qilingan</p>
              <Button onClick={() => window.location.href = ROUTES.orders} className="w-full">
                Buyurtmalarimni ko‘rish
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text">Buyurtma #{order.id}</h1>
              <p className="text-sm text-text-muted mt-1">
                {new Date(order.created_at).toLocaleDateString('uz-UZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
              <div className="text-right">
                <p className="text-sm text-text-muted mb-1">Holat</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'COMPLETED' || order.status === 'REJECTED' ? 'bg-green-100 text-green-700' :
                  order.status === 'DELIVERING' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'ACCEPTED' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status === 'PENDING' && 'Kutilmoqda'}
                  {order.status === 'ACCEPTED' && 'Tasdiqlangan'}
                  {order.status === 'DELIVERING' && 'Yetkazilmoqda'}
                  {order.status === 'COMPLETED' && 'Tugallangan'}
                </span>
              </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-text mb-4">Buyurtma tarkibi</h2>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: OrderItem) => (
                    <div key={item.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                      <div className="w-20 h-20 bg-surface rounded-lg flex items-center justify-center text-2xl">
                        📦
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-text">{item.product.name}</h3>
                        <p className="text-sm text-text-muted">{item.price} so'm / dona</p>
                      </div>
                      <div className="w-24 text-right">
                        <p className="text-sm font-medium text-text">{item.quantity} dona</p>
                        <p className="text-sm font-semibold text-primary">{item.subtotal}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-text-muted">Mahsulotlar yo'q</p>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-text mb-4">Jarayon</h2>
              <OrderTimeline order={order} />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-border p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-text mb-4">Buyurtma xulosa</h2>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text mb-2">Mijoz ma’lumotlari</h3>
                 <p className="text-sm text-text-muted mb-1">
                   {order.customer.first_name}
                 </p>
                <p className="text-sm text-text-muted">{order.customer.phone}</p>
              </div>

              {/* Store Info */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text mb-2">Do‘kon ma’lumotlari</h3>
                <p className="text-sm text-text-muted">{order.store.name}</p>
              </div>

              {/* Delivery Address */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text mb-2">Manzil</h3>
                 <p className="text-sm text-text-muted">{order.address.village.name}</p>
                 <p className="text-sm text-text-muted">{order.address.street}</p>
                 <p className="text-sm text-text-muted">
                   Uy: {order.address.house}
                 </p>
              </div>

              {/* Order Summary */}
              <OrderSummary order={order} />

              {/* Notes */}
              {order.note && (
                <div className="mb-4 p-4 bg-surface rounded-lg">
                  <p className="text-sm font-medium text-text mb-1">Izoh:</p>
                  <p className="text-sm text-text-muted">{order.note}</p>
                </div>
              )}

              {/* Actions */}
              {order.status === 'PENDING' && (
                <div className="pt-4 border-t border-border">
                  <Button onClick={handleCancelOrder} variant="danger" className="w-full" disabled={isCanceling}>
                    {isCanceling ? 'Bekor qilinmoqda...' : 'Bekor qilish'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
