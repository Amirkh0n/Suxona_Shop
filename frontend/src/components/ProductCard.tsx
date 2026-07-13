/**
 * ProductCard — reusable product card component.
 *
 * Used on: Home, Search, Product Listing, Store Detail pages.
 *
 * Requirements (Design System, UI/UX Spec):
 * - Product image (1:1 ratio)
 * - Product name (max 2 lines with line clamp)
 * - Price (visually dominant)
 * - Store name
 * - Favorite button (future)
 * - Add to cart button
 * - Clicking card opens Product Detail Page
 * - Clicking Add to Cart: auth modal if guest, add if authenticated
 *
 * Phase 3A: UI only, no API calls, no auth logic. Mock interactions.
 */
import { ShoppingCart, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildPath } from '@/routes/paths'

export interface ProductCardProps {
  id: number
  name: string
  price: string
  image: string
  storeName: string
  onAddToCart?: () => void
  onToggleFavorite?: () => void
}

export function ProductCard({
  id,
  name,
  price,
  image,
  storeName,
  onAddToCart,
  onToggleFavorite,
}: ProductCardProps) {
  return (
    <article className="group relative flex flex-col rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Product Image + Link */}
      <Link
        to={buildPath.productDetail(id)}
        className="block overflow-hidden rounded-t-2xl bg-surface"
        style={{ aspectRatio: '1/1' }}
      >
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Favorite Button (top-right overlay) */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          onToggleFavorite?.()
        }}
        aria-label="Add to favorites"
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-text-muted shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-error"
      >
        <Heart size={18} aria-hidden="true" />
      </button>

      {/* Card Content */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        {/* Product Name (max 2 lines) */}
        <Link
          to={buildPath.productDetail(id)}
          className="line-clamp-2 text-sm font-medium text-text transition-colors hover:text-primary"
        >
          {name}
        </Link>

        {/* Store Name */}
        <p className="text-xs text-text-muted">{storeName}</p>

        {/* Price + Add to Cart */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-base font-bold text-text">{price}</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onAddToCart?.()
            }}
            aria-label="Add to cart"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-hover"
          >
            <ShoppingCart size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
