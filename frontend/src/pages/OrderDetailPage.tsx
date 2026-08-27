/**
 * OrderDetailPage — Detailed order information
 *
 * Route: /orders/:orderId
 *
 * Displays:
 * - Order timeline (status progression)
 * - Current status badge
 * - Store information
 * - Delivery address
 * - Contact information
 * - Ordered products list
 * - Price summary
 * - Delivery information
 * - Support button
 * - Repeat Order button
 *
 * Phase 3A: UI only, no API calls. Mock data.
 *
 * Future API integration points:
 * - GET /api/v1/orders/{order_id} (order details)
 * - POST /api/v1/orders/{order_id}/cancel (cancel order)
 */
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  MessageCircle,
  RefreshCw,
  Store,
  MapPin,
  User,
  Phone,
} from 'lucide-react'
import { CheckoutSection } from '@/components/CheckoutSection'
import { OrderTimeline } from '@/components/OrderTimeline'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { PriceSummary } from '@/components/PriceSummary'
import { DeliveryInfoCard } from '@/components/DeliveryInfoCard'
import { buildPath, ROUTES } from '@/routes/paths'

type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  // Mock order data
  const MOCK_ORDER = {
    id: Number(orderId),
    orderNumber: `ORD-${orderId}`,
    status: 'DELIVERING' as OrderStatus,
    createdAt: '24 января 2024, 14:30',
    store: {
      id: 1,
      name: 'Uzum Market',
      logo: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100&h=100&fit=crop',
    },
    deliveryAddress: {
      fullName: 'Aziz Karimov',
      phone: '+998901234567',
      village: 'Tashkent, Chilonzor',
      street: 'Bunyodkor ko\'chasi',
      house: '12, кв. 45',
    },
    deliveryMethod: 'delivery' as const,
    estimatedDelivery: '25-27 января, 10:00-18:00',
    deliveryCost: 0,
    trackingNumber: 'TRK-98765432',
    items: [
      {
        id: 1,
        productId: 101,
        name: 'Samsung Galaxy A54',
        price: '3200000',
        image:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
        quantity: 1,
      },
      {
        id: 2,
        productId: 102,
        name: 'Беспроводные наушники AirPods',
        price: '890000',
        image:
          'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200&h=200&fit=crop',
        quantity: 2,
      },
    ],
    contactName: 'Aziz Karimov',
    contactPhone: '+998901234567',
    comment: 'Позвонить за час до доставки',
    timestamps: {
      pending: '24 января, 14:30',
      accepted: '24 января, 14:45',
      delivering: '25 января, 09:00',
    },
  }

  const subtotal = MOCK_ORDER.items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  )
  const total = subtotal + MOCK_ORDER.deliveryCost

  const handleRepeatOrder = () => {
    console.log('Repeat order:', orderId)
    alert('Функция "Повторить заказ" будет реализована в Phase 3B')
  }

  const handleContactSupport = () => {
    console.log('Contact support for order:', orderId)
    alert('Функция "Связаться с поддержкой" будет реализована в Phase 3B')
  }

  const handleCancelOrder = () => {
    const confirmed = confirm('Вы уверены, что хотите отменить заказ?')
    if (confirmed) {
      console.log('Cancel order:', orderId)
      alert('Функция отмены заказа будет реализована в Phase 3B')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-4">
          <button
            onClick={() => navigate(ROUTES.orders)}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-surface"
            aria-label="Назад"
          >
            <ChevronLeft className="h-5 w-5 text-text" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-text">
              Заказ {MOCK_ORDER.orderNumber}
            </h1>
            <p className="text-xs text-text-muted">{MOCK_ORDER.createdAt}</p>
          </div>
          <OrderStatusBadge status={MOCK_ORDER.status} />
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] space-y-4 p-4">
        {/* Order Timeline */}
        <CheckoutSection title="Статус заказа">
          <OrderTimeline
            currentStatus={MOCK_ORDER.status}
            timestamps={MOCK_ORDER.timestamps}
          />
        </CheckoutSection>

        {/* Store Information */}
        <CheckoutSection title="Магазин">
          <Link
            to={buildPath.storeDetail(MOCK_ORDER.store.id)}
            className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface">
              {MOCK_ORDER.store.logo ? (
                <img
                  src={MOCK_ORDER.store.logo}
                  alt={MOCK_ORDER.store.name}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <Store className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <p className="font-semibold text-text">{MOCK_ORDER.store.name}</p>
              <p className="text-sm text-primary">Перейти в магазин →</p>
            </div>
          </Link>
        </CheckoutSection>

        {/* Ordered Products */}
        <CheckoutSection title="Товары">
          <div className="space-y-3">
            {MOCK_ORDER.items.map((item) => {
              const itemTotal = parseFloat(item.price) * item.quantity

              return (
                <Link
                  key={item.id}
                  to={buildPath.productDetail(item.productId)}
                  className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-surface"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-text">
                      {item.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-text-muted">
                        × {item.quantity}
                      </span>
                      <span className="font-bold text-primary">
                        {itemTotal.toLocaleString()} сум
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <PriceSummary
              itemsCount={MOCK_ORDER.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              )}
              subtotal={subtotal}
              deliveryCost={MOCK_ORDER.deliveryCost}
              total={total}
            />
          </div>
        </CheckoutSection>

        {/* Delivery Information */}
        <CheckoutSection title="Доставка">
          <DeliveryInfoCard
            method={MOCK_ORDER.deliveryMethod}
            estimatedDate={MOCK_ORDER.estimatedDelivery}
            cost={MOCK_ORDER.deliveryCost}
            trackingNumber={MOCK_ORDER.trackingNumber}
          />
        </CheckoutSection>

        {/* Delivery Address */}
        <CheckoutSection title="Адрес доставки">
          <div className="flex gap-3 rounded-xl border border-border p-4">
            <MapPin className="h-5 w-5 flex-shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-semibold text-text">
                {MOCK_ORDER.deliveryAddress.fullName}
              </p>
              <p className="mt-1 text-text-muted">
                {MOCK_ORDER.deliveryAddress.phone}
              </p>
              <p className="mt-2 font-medium text-text">
                {MOCK_ORDER.deliveryAddress.village}
              </p>
              <p className="mt-1 text-text-muted">
                {MOCK_ORDER.deliveryAddress.street},{' '}
                {MOCK_ORDER.deliveryAddress.house}
              </p>
            </div>
          </div>
        </CheckoutSection>

        {/* Contact Information */}
        <CheckoutSection title="Контактная информация">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User className="h-5 w-5 text-text-muted" />
              <span className="text-text-muted">Имя:</span>
              <span className="font-medium text-text">
                {MOCK_ORDER.contactName}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-5 w-5 text-text-muted" />
              <span className="text-text-muted">Телефон:</span>
              <span className="font-medium text-text">
                {MOCK_ORDER.contactPhone}
              </span>
            </div>
            {MOCK_ORDER.comment && (
              <div className="mt-3 rounded-lg bg-surface p-3">
                <p className="text-xs text-text-muted">Комментарий:</p>
                <p className="mt-1 text-sm text-text">{MOCK_ORDER.comment}</p>
              </div>
            )}
          </div>
        </CheckoutSection>

        {/* Action Buttons */}
        <div className="space-y-3">
          {['PENDING', 'ACCEPTED'].includes(MOCK_ORDER.status) && (
            <button
              onClick={handleCancelOrder}
              className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-error bg-white font-semibold text-error transition-colors hover:bg-error/10"
            >
              Отменить заказ
            </button>
          )}

          <button
            onClick={handleRepeatOrder}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <RefreshCw className="h-5 w-5" />
            Повторить заказ
          </button>

          <button
            onClick={handleContactSupport}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-border bg-white font-semibold text-text transition-colors hover:bg-surface"
          >
            <MessageCircle className="h-5 w-5" />
            Связаться с поддержкой
          </button>
        </div>
      </div>
    </div>
  )
}
