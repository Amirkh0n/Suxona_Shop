/**
 * CartPage — Shopping cart with per-store checkout
 *
 * Marketplace architecture:
 * - Products are grouped by store
 * - Each store has its own checkout button
 * - Checkout navigates to /checkout/:storeId
 * - Orders are placed per-store
 *
 * States:
 * - Loading: CartSkeleton
 * - Empty: Empty cart message with CTA
 * - Error: Error message with retry
 * - Success: Store-grouped cart items
 *
 * Phase 3A: UI only, no API calls. Mock data.
 *
 * Future API integration points:
 * - GET /api/v1/cart (retrieve cart)
 * - PATCH /api/v1/cart/items/{item_id} (update quantity)
 * - DELETE /api/v1/cart/items/{item_id} (remove item)
 * - DELETE /api/v1/cart (clear cart)
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Trash2, AlertCircle } from 'lucide-react'
import { CartStoreGroup } from '@/components/CartStoreGroup'
import { CartSkeleton } from '@/components/CartSkeleton'
import { ROUTES } from '@/routes/paths'

// Mock cart data grouped by store
const MOCK_CART_DATA = {
  stores: [
    {
      storeId: 1,
      storeName: 'Uzum Market',
      storeLogo:
        'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100&h=100&fit=crop',
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
    },
    {
      storeId: 2,
      storeName: 'TechnoMart',
      storeLogo:
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop',
      items: [
        {
          id: 3,
          productId: 201,
          name: 'Ноутбук Lenovo IdeaPad',
          price: '5600000',
          image:
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop',
          quantity: 1,
        },
      ],
    },
  ],
}

type ViewState = 'loading' | 'error' | 'empty' | 'success'

export default function CartPage() {
  const [viewState, setViewState] = useState<ViewState>('success')
  const [cartData, setCartData] = useState(MOCK_CART_DATA)

  // Mock handlers (will be replaced with API calls in Phase 3B)
  const handleQuantityChange = (
    storeId: number,
    itemId: number,
    newQuantity: number
  ) => {
    console.log('Update quantity:', { storeId, itemId, newQuantity })
    setCartData((prev) => ({
      ...prev,
      stores: prev.stores.map((store) =>
        store.storeId === storeId
          ? {
              ...store,
              items: store.items.map((item) =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
              ),
            }
          : store
      ),
    }))
  }

  const handleRemoveItem = (storeId: number, itemId: number) => {
    console.log('Remove item:', { storeId, itemId })
    setCartData((prev) => ({
      ...prev,
      stores: prev.stores
        .map((store) =>
          store.storeId === storeId
            ? {
                ...store,
                items: store.items.filter((item) => item.id !== itemId),
              }
            : store
        )
        .filter((store) => store.items.length > 0),
    }))

    // Show empty state if no items left
    if (
      cartData.stores.every(
        (store) =>
          store.storeId !== storeId ||
          store.items.filter((item) => item.id !== itemId).length === 0
      ) &&
      cartData.stores.filter(
        (store) => store.storeId !== storeId || store.items.length > 1
      ).length === 0
    ) {
      setViewState('empty')
    }
  }

  const handleClearCart = () => {
    console.log('Clear cart')
    setCartData({ stores: [] })
    setViewState('empty')
  }

  const handleRetry = () => {
    console.log('Retry loading cart')
    setViewState('loading')
    setTimeout(() => setViewState('success'), 1000)
  }

  // Calculate total items across all stores
  const totalItems = cartData.stores.reduce(
    (sum, store) =>
      sum + store.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  )

  // Calculate grand total across all stores
  const grandTotal = cartData.stores.reduce(
    (sum, store) =>
      sum +
      store.items.reduce(
        (itemSum, item) => itemSum + parseFloat(item.price) * item.quantity,
        0
      ),
    0
  )

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-text">Корзина</h1>
            {viewState === 'success' && totalItems > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {totalItems}
              </span>
            )}
          </div>
          {viewState === 'success' && cartData.stores.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-1 text-sm text-error transition-colors hover:text-error/80"
            >
              <Trash2 className="h-4 w-4" />
              <span>Очистить</span>
            </button>
          )}
        </div>
      </header>

      {/* Loading State */}
      {viewState === 'loading' && <CartSkeleton />}

      {/* Error State */}
      {viewState === 'error' && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <AlertCircle className="h-8 w-8 text-error" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-text">Ошибка загрузки</h2>
          <p className="mb-6 max-w-sm text-text-muted">
            Не удалось загрузить корзину. Проверьте подключение к интернету и
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

      {/* Empty State */}
      {viewState === 'empty' && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-surface">
            <ShoppingCart className="h-12 w-12 text-text-muted" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-text">Корзина пуста</h2>
          <p className="mb-6 max-w-sm text-text-muted">
            Добавьте товары, чтобы оформить заказ
          </p>
          <Link
            to={ROUTES.home}
            className="flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Перейти к покупкам
          </Link>
        </div>
      )}

      {/* Success State - Store Grouped Cart */}
      {viewState === 'success' && cartData.stores.length > 0 && (
        <>
          <div className="mx-auto max-w-[1280px] space-y-4 p-4">
            {cartData.stores.map((store) => (
              <CartStoreGroup
                key={store.storeId}
                storeId={store.storeId}
                storeName={store.storeName}
                storeLogo={store.storeLogo}
                items={store.items}
                onQuantityChange={(itemId, newQuantity) =>
                  handleQuantityChange(store.storeId, itemId, newQuantity)
                }
                onRemove={(itemId) => handleRemoveItem(store.storeId, itemId)}
              />
            ))}
          </div>

          {/* Grand Total Summary (Sticky Bottom) */}
          <div className="fixed bottom-16 left-0 right-0 border-t border-border bg-white shadow-lg md:bottom-0">
            <div className="mx-auto flex max-w-[1280px] items-center justify-between p-4">
              <div>
                <p className="text-sm text-text-muted">
                  Всего {totalItems} {totalItems === 1 ? 'товар' : 'товаров'}
                </p>
                <p className="text-xl font-bold text-primary">
                  {grandTotal.toFixed(2)} сум
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">
                  {cartData.stores.length}{' '}
                  {cartData.stores.length === 1 ? 'магазин' : 'магазинов'}
                </p>
                <p className="text-sm text-text-muted">Оформите каждый отдельно</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
