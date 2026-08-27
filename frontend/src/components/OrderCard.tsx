/**
 * OrderCard — Reusable order list item card
 *
 * Displays:
 * - Store info (logo + name)
 * - Order number
 * - Order status badge
 * - Product thumbnails (max 4)
 * - Total amount
 * - Order date
 * - View Details button
 *
 * Reusable in: Orders List, Profile Orders Section
 *
 * Phase 3A: UI only
 */
import { Store, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { buildPath } from '@/routes/paths'

type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'

interface OrderCardProps {
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

export function OrderCard({
  id,
  orderNumber,
  storeName,
  storeLogo,
  status,
  productImages,
  totalAmount,
  createdAt,
}: OrderCardProps) {
  const displayImages = productImages.slice(0, 4)
  const remainingCount = productImages.length - 4

  return (
    <Link
      to={buildPath.orderDetail(id)}
      className="block rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Store Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-surface">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={storeName}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <Store className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-text">{storeName}</p>
            <p className="text-xs text-text-muted">#{orderNumber}</p>
          </div>
        </div>
        <OrderStatusBadge status={status} />
      </div>

      {/* Product Thumbnails */}
      <div className="mb-3 flex gap-2">
        {displayImages.map((image, index) => (
          <div
            key={index}
            className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface"
          >
            <img
              src={image}
              alt={`Product ${index + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-surface text-xs font-semibold text-text-muted">
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div>
          <p className="text-xs text-text-muted">{createdAt}</p>
          <p className="mt-1 text-lg font-bold text-primary">
            {totalAmount.toLocaleString()} сум
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-primary">
          Подробнее
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  )
}
