/**
 * StoreCard — reusable store card component.
 *
 * Used on: Home (Nearby Stores), Search (Store Results), Stores Page.
 *
 * Requirements (UI/UX Spec):
 * - Store Logo
 * - Store Name
 * - Rating
 * - Delivery Information
 * - Product Count
 * - Clicking opens Store Detail Page
 *
 * Phase 3A: UI only, no API calls. Mock data.
 */
import { Star, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildPath } from '@/routes/paths'

export interface StoreCardProps {
  id: number
  name: string
  logo: string
  rating: number
  productCount: number
  deliveryInfo: string
}

export function StoreCard({
  id,
  name,
  logo,
  rating,
  productCount,
  deliveryInfo,
}: StoreCardProps) {
  return (
    <Link
      to={buildPath.storeDetail(id)}
      className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Store Logo */}
      <div className="flex-shrink-0 overflow-hidden rounded-xl bg-surface">
        <img
          src={logo}
          alt={`${name} logo`}
          loading="lazy"
          className="h-16 w-16 object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Store Info */}
      <div className="flex-1 min-w-0">
        {/* Store Name */}
        <h3 className="truncate font-semibold text-text transition-colors group-hover:text-primary">
          {name}
        </h3>

        {/* Rating */}
        <div className="mt-1 flex items-center gap-1 text-xs text-text-muted">
          <Star size={14} className="fill-warning text-warning" aria-hidden="true" />
          <span className="font-medium">{rating.toFixed(1)}</span>
        </div>

        {/* Delivery Info */}
        <p className="mt-1 text-xs text-text-muted">{deliveryInfo}</p>
      </div>

      {/* Product Count Badge */}
      <div className="flex flex-col items-center gap-1 rounded-lg bg-surface px-3 py-2">
        <Package size={18} className="text-primary" aria-hidden="true" />
        <span className="text-xs font-medium text-text">{productCount}</span>
      </div>
    </Link>
  )
}
