/**
 * CartStoreGroup — Store-grouped cart section with per-store checkout
 *
 * Displays:
 * - Store header with logo and name
 * - List of cart items from this store
 * - Store subtotal
 * - Delivery cost placeholder
 * - Total for this store
 * - Checkout button (navigates to /checkout/:storeId)
 *
 * Phase 3A: UI only, no API calls. Mock interactions.
 */
import { Store, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CartItemRow } from '@/components/CartItemRow'
import { buildPath } from '@/routes/paths'

interface CartItem {
  id: number
  productId: number
  name: string
  price: string
  image: string
  quantity: number
}

interface CartStoreGroupProps {
  storeId: number
  storeName: string
  storeLogo?: string
  items: CartItem[]
  onQuantityChange: (itemId: number, newQuantity: number) => void
  onRemove: (itemId: number) => void
}

export function CartStoreGroup({
  storeId,
  storeName,
  storeLogo,
  items,
  onQuantityChange,
  onRemove,
}: CartStoreGroupProps) {
  // Calculate store subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  ) as number

  // Placeholder for delivery cost (will come from API in Phase 3B)
  const deliveryCost = 0 as number

  const total = (subtotal + deliveryCost) as number

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      {/* Store Header */}
      <Link
        to={buildPath.storeDetail(storeId)}
        className="mb-4 flex items-center gap-3 transition-opacity hover:opacity-80"
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface">
          {storeLogo ? (
            <img
              src={storeLogo}
              alt={storeName}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <Store className="h-6 w-6 text-primary" />
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold text-text">{storeName}</h3>
          <p className="text-sm text-text-muted">
            {items.length} {items.length === 1 ? 'товар' : 'товаров'}
          </p>
        </div>
      </Link>

      {/* Cart Items */}
      <div className="mb-4 space-y-3">
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            {...item}
            onQuantityChange={(newQuantity) =>
              onQuantityChange(item.id, newQuantity)
            }
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </div>

      {/* Store Summary */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Товары ({items.length})</span>
          <span className="font-semibold text-text">{subtotal.toFixed(2)} сум</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Доставка</span>
          <span className="font-semibold text-text">
            {deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost.toFixed(2)} сум`}
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <span className="text-base font-bold text-text">Итого</span>
          <span className="text-lg font-bold text-primary">{total.toFixed(2)} сум</span>
        </div>
      </div>

      {/* Checkout Button */}
      <Link
        to={buildPath.checkout(storeId)}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        <ShoppingBag className="h-5 w-5" />
        Оформить заказ
      </Link>
    </div>
  )
}
