/**
 * OrdersPage — User orders list with tabs
 *
 * Route: /orders
 *
 * Tabs:
 * - Active (PENDING, ACCEPTED, DELIVERING)
 * - Completed (COMPLETED)
 * - Cancelled (CANCELLED, REJECTED)
 *
 * States:
 * - Loading: Skeleton
 * - Empty: Empty state per tab
 * - Error: Error message with retry
 * - Success: Order cards list
 *
 * Phase 3A: UI only, no API calls. Mock data.
 *
 * Future API integration points:
 * - GET /api/v1/orders/my (with status filter)
 */
import { useState } from 'react'
import { ShoppingBag, Package, AlertCircle } from 'lucide-react'
import { OrderCard } from '@/components/OrderCard'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'

type Tab = 'active' | 'completed' | 'cancelled'

interface Order {
  id: number
  orderNumber: string
  storeId: number
  storeName: string
  storeLogo?: string
  status: OrderStatus
  productImages: string[]
  totalAmount: number
  createdAt: string
}

// Mock orders data
const MOCK_ORDERS: Order[] = [
  {
    id: 12345,
    orderNumber: 'ORD-12345',
    storeId: 1,
    storeName: 'Uzum Market',
    storeLogo:
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100&h=100&fit=crop',
    status: 'DELIVERING',
    productImages: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200&h=200&fit=crop',
    ],
    totalAmount: 4980000,
    createdAt: '24 января, 14:30',
  },
  {
    id: 12344,
    orderNumber: 'ORD-12344',
    storeId: 2,
    storeName: 'TechnoMart',
    storeLogo:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop',
    status: 'ACCEPTED',
    productImages: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop',
    ],
    totalAmount: 5600000,
    createdAt: '23 января, 16:20',
  },
  {
    id: 12343,
    orderNumber: 'ORD-12343',
    storeId: 1,
    storeName: 'Uzum Market',
    storeLogo:
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100&h=100&fit=crop',
    status: 'COMPLETED',
    productImages: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=200&h=200&fit=crop',
    ],
    totalAmount: 2400000,
    createdAt: '20 января, 10:15',
  },
  {
    id: 12342,
    orderNumber: 'ORD-12342',
    storeId: 3,
    storeName: 'Fashion Store',
    status: 'CANCELLED',
    productImages: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
    ],
    totalAmount: 890000,
    createdAt: '18 января, 09:45',
  },
]

type ViewState = 'loading' | 'error' | 'success'

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<Tab>('active')
  const [viewState, setViewState] = useState<ViewState>('success')

  const filterOrdersByTab = (tab: Tab): Order[] => {
    switch (tab) {
      case 'active':
        return MOCK_ORDERS.filter((order) =>
          ['PENDING', 'ACCEPTED', 'DELIVERING'].includes(order.status)
        )
      case 'completed':
        return MOCK_ORDERS.filter((order) => order.status === 'COMPLETED')
      case 'cancelled':
        return MOCK_ORDERS.filter((order) =>
          ['CANCELLED', 'REJECTED'].includes(order.status)
        )
    }
  }

  const filteredOrders = filterOrdersByTab(activeTab)

  const handleRetry = () => {
    console.log('Retry loading orders')
    setViewState('loading')
    setTimeout(() => setViewState('success'), 1000)
  }

  const TABS = [
    { id: 'active' as Tab, label: 'Активные', count: filterOrdersByTab('active').length },
    {
      id: 'completed' as Tab,
      label: 'Завершенные',
      count: filterOrdersByTab('completed').length,
    },
    {
      id: 'cancelled' as Tab,
      label: 'Отмененные',
      count: filterOrdersByTab('cancelled').length,
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center px-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-text">Мои заказы</h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-14 z-10 border-b border-border bg-white">
        <div className="mx-auto max-w-[1280px] px-4">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex h-12 flex-1 items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary'
                        : 'bg-surface text-text-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] p-4">
        {/* Loading State */}
        {viewState === 'loading' && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-10 w-10 animate-pulse rounded-lg bg-surface" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-surface" />
                    <div className="h-3 w-20 animate-pulse rounded bg-surface" />
                  </div>
                  <div className="h-6 w-20 animate-pulse rounded-full bg-surface" />
                </div>
                <div className="mb-3 flex gap-2">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-16 w-16 animate-pulse rounded-lg bg-surface"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-surface" />
                    <div className="h-5 w-32 animate-pulse rounded bg-surface" />
                  </div>
                  <div className="h-4 w-20 animate-pulse rounded bg-surface" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {viewState === 'error' && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
              <AlertCircle className="h-8 w-8 text-error" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-text">Ошибка загрузки</h2>
            <p className="mb-6 max-w-sm text-text-muted">
              Не удалось загрузить заказы. Проверьте подключение к интернету и
              попробуйте снова.
            </p>
            <button
              onClick={handleRetry}
              className="flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Повторить
            </button>
          </div>
        )}

        {/* Success State - Empty */}
        {viewState === 'success' && filteredOrders.length === 0 && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-surface">
              <ShoppingBag className="h-12 w-12 text-text-muted" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-text">
              {activeTab === 'active' && 'Нет активных заказов'}
              {activeTab === 'completed' && 'Нет завершенных заказов'}
              {activeTab === 'cancelled' && 'Нет отмененных заказов'}
            </h2>
            <p className="mb-6 max-w-sm text-text-muted">
              {activeTab === 'active' &&
                'Оформите заказ, чтобы начать покупки'}
              {activeTab === 'completed' &&
                'Завершенные заказы появятся здесь'}
              {activeTab === 'cancelled' &&
                'Отмененные заказы появятся здесь'}
            </p>
            <Link
              to={ROUTES.home}
              className="flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Перейти к покупкам
            </Link>
          </div>
        )}

        {/* Success State - Orders List */}
        {viewState === 'success' && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} {...order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
