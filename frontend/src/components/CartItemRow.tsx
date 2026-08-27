/**
 * CartItemRow — Individual cart item with quantity controls
 *
 * Displays:
 * - Product thumbnail
 * - Product name
 * - Product price
 * - Quantity selector (-, count, +)
 * - Remove button
 *
 * Phase 3A: UI only, no API calls. Mock interactions.
 */
import { Trash2, Minus, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildPath } from '@/routes/paths'

interface CartItemRowProps {
  id: number
  productId: number
  name: string
  price: string
  image: string
  quantity: number
  onQuantityChange: (newQuantity: number) => void
  onRemove: () => void
}

export function CartItemRow({
  productId,
  name,
  price,
  image,
  quantity,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleIncrease = () => {
    onQuantityChange(quantity + 1)
  }

  const itemTotal = (parseFloat(price) * quantity).toFixed(2)

  return (
    <div className="flex gap-3 rounded-2xl bg-white p-3">
      {/* Product Image */}
      <Link
        to={buildPath.productDetail(productId)}
        className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface"
      >
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            to={buildPath.productDetail(productId)}
            className="line-clamp-2 text-sm font-medium text-text transition-colors hover:text-primary"
          >
            {name}
          </Link>
          <p className="mt-1 text-lg font-bold text-primary">{itemTotal} сум</p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              disabled={quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white transition-colors hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4 text-text" />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold text-text">
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white transition-colors hover:bg-surface"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4 text-text" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-error transition-colors hover:bg-error/10"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
