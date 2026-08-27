/**
 * OrderSummary — Reusable order items summary
 *
 * Displays:
 * - Store header with logo and name
 * - Product list (compact view)
 * - Item count
 *
 * Reusable in: Checkout Review, Order Confirmation, Order Details
 *
 * Phase 3A: UI only
 */
import { Store, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildPath } from '@/routes/paths'

interface OrderItem {
  id: number
  productId: number
  name: string
  price: string
  image: string
  quantity: number
}

interface OrderSummaryProps {
  storeId: number
  storeName: string
  storeLogo?: string
  items: OrderItem[]
  showProductLinks?: boolean
}

export function OrderSummary({
  storeId,
  storeName,
  storeLogo,
  items,
  showProductLinks = true,
}: OrderSummaryProps) {
  return (
    <div>
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
            <Package className="inline h-3 w-3" /> {items.length}{' '}
            {items.length === 1 ? 'товар' : 'товаров'}
          </p>
        </div>
      </Link>

      {/* Product List */}
      <div className="space-y-3">
        {items.map((item) => {
          const itemTotal = parseFloat(item.price) * item.quantity

          const content = (
            <div className="flex gap-3">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
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
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-text-muted">× {item.quantity}</span>
                  <span className="text-sm font-bold text-primary">
                    {itemTotal.toLocaleString()} сум
                  </span>
                </div>
              </div>
            </div>
          )

          return showProductLinks ? (
            <Link
              key={item.id}
              to={buildPath.productDetail(item.productId)}
              className="block rounded-lg p-2 transition-colors hover:bg-surface"
            >
              {content}
            </Link>
          ) : (
            <div key={item.id} className="rounded-lg p-2">
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
