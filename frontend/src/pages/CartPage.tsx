/**
 * CartPage - Cart page with real API integration
 *
 * Features:
 * - Real API integration with backend
 * - Loading states with skeleton
 * - Empty state when cart is empty
 * - Update item quantities
 * - Remove items from cart
 * - Clear cart
 * - Proceed to checkout
 */

import { useEffect } from 'react'
import { ROUTES } from '@/routes/paths'
import { useCart } from '@/features/cart/useCart'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyCart } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'

export default function CartPage() {
  const {
    cart,
    isLoading,
    isRefetching,
    error,
    updateItem,
    removeItem,
    clearCart,
    totalItems,
    total,
    refetch,
  } = useCart()

  useEffect(() => {
    // Refresh cart data on mount
    refetch()
  }, [refetch])

  const handleIncrease = async (itemId: number, currentQuantity: number) => {
    try {
      await updateItem.mutateAsync({ itemId, quantity: currentQuantity + 1 })
    } catch (error) {
      console.error('Failed to increase quantity:', error)
    }
  }

  const handleDecrease = async (itemId: number, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      // Remove item if quantity is 1
      try {
        await removeItem.mutateAsync(itemId)
      } catch (error) {
        console.error('Failed to remove item:', error)
      }
      return
    }

    try {
      await updateItem.mutateAsync({ itemId, quantity: currentQuantity - 1 })
    } catch (error) {
      console.error('Failed to decrease quantity:', error)
    }
  }

  const handleRemove = async (itemId: number) => {
    try {
      await removeItem.mutateAsync(itemId)
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCart.mutateAsync()
    } catch (error) {
      console.error('Failed to clear cart:', error)
    }
  }

  const handleCheckout = () => {
    if (cart && cart.stores.length > 0) {
      window.location.href = `/checkout/${cart.stores[0].store_id}`
    }
  }

  if (isLoading || isRefetching) {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton width="100%" height="2rem" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <EmptyCart onContinue={() => window.location.href = ROUTES.home} />
  }

  if (!cart || cart.stores.length === 0) {
    return <EmptyCart onContinue={() => window.location.href = '/products'} />
  }

  return (
    <div className="min-h-screen bg-surface p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">Savat</h1>
          <p className="text-text-muted">Savatda {totalItems} ta mahsulot bor</p>
        </div>

        <div className="space-y-6">
          {cart.stores.map((storeGroup: any) => (
            <div key={storeGroup.store_id} className="bg-white rounded-lg border border-border p-6">
              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text">{storeGroup.store_name}</h2>
                  <div className="text-sm text-text-muted">
                    Umumiy: {storeGroup.total}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {storeGroup.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-text">{item.product.name}</h3>
                      <p className="text-sm text-text-muted">{item.product.price} so'm</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDecrease(item.id, item.quantity)}
                        disabled={updateItem.isPending || removeItem.isPending}
                      >
                        -
                      </Button>

                      <span className="w-8 text-center text-sm font-medium text-text">
                        {item.quantity}
                      </span>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleIncrease(item.id, item.quantity)}
                        disabled={updateItem.isPending || removeItem.isPending}
                      >
                        +
                      </Button>
                    </div>

                    <div className="w-32 text-right">
                      <p className="text-sm font-medium text-text">{item.subtotal}</p>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(item.id)}
                      disabled={removeItem.isPending}
                      className="text-danger hover:text-danger-hover hover:bg-danger hover:bg-opacity-10"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Yetkazib berish: {storeGroup.delivery_price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-muted">Summa: {storeGroup.subtotal}</p>
                    <p className="text-lg font-bold text-text">Jami: {storeGroup.total}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-text-muted">Umumiy narx</p>
              <p className="text-2xl font-bold text-text">{total}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClearCart} disabled={clearCart.isPending}>
              {clearCart.isPending ? 'Tozalash...' : 'Tozalash'}
            </Button>

            <Button onClick={handleCheckout} disabled={!totalItems || totalItems === 0}>
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
