/**
 * OrderSuccessPage — Order confirmation page
 *
 * Route: /order-success/:orderId
 *
 * Displays:
 * - Success illustration/icon
 * - Order number
 * - Estimated delivery time
 * - Store name
 * - Total amount
 * - Continue Shopping button
 * - View Orders button
 *
 * Phase 3A: UI only, no API calls. Mock data.
 *
 * Future API integration points:
 * - GET /api/v1/orders/{order_id} (order details)
 */
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, ShoppingBag, FileText } from 'lucide-react'
import { ROUTES, buildPath } from '@/routes/paths'

export default function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>()

  // Mock order data
  const MOCK_ORDER = {
    id: orderId,
    orderNumber: `ORD-${orderId}`,
    storeName: 'Uzum Market',
    totalAmount: 4980000,
    estimatedDelivery: '25-27 января, 10:00-18:00',
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center justify-center p-4">
        {/* Success Icon */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-12 w-12 text-success" />
        </div>

        {/* Success Message */}
        <h1 className="mb-2 text-center text-2xl font-bold text-text">
          Заказ оформлен!
        </h1>
        <p className="mb-8 text-center text-text-muted">
          Ваш заказ успешно принят и будет обработан в ближайшее время
        </p>

        {/* Order Info Card */}
        <div className="mb-8 w-full rounded-2xl bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-text-muted">Номер заказа:</span>
              <span className="font-semibold text-text">
                {MOCK_ORDER.orderNumber}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-muted">Магазин:</span>
              <span className="font-semibold text-text">
                {MOCK_ORDER.storeName}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-muted">Сумма заказа:</span>
              <span className="text-lg font-bold text-primary">
                {MOCK_ORDER.totalAmount.toLocaleString()} сум
              </span>
            </div>

            <div className="rounded-lg bg-primary/5 p-3">
              <p className="text-sm font-medium text-text">
                Ожидаемая доставка:
              </p>
              <p className="mt-1 text-base font-semibold text-primary">
                {MOCK_ORDER.estimatedDelivery}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <Link
            to={buildPath.orderDetail(Number(orderId))}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <FileText className="h-5 w-5" />
            Посмотреть заказ
          </Link>

          <Link
            to={ROUTES.home}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-border bg-white font-semibold text-text transition-colors hover:bg-surface"
          >
            <ShoppingBag className="h-5 w-5" />
            Продолжить покупки
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 rounded-xl bg-blue-50 p-4 text-center">
          <p className="text-sm text-blue-900">
            Информация о заказе отправлена на ваш номер телефона
          </p>
        </div>
      </div>
    </div>
  )
}
