/**
 * ProductCard component
 *
 * Displays a product in a card format for the product listing and details pages.
 */

import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { ROUTES } from '@/routes/paths'
import { cn } from '@/utils/cn'

export interface ProductCardProps extends Omit<Product, 'id'> {
  id: number
  image?: string
  className?: string
  storeName?: string
}

export function ProductCard({ id, name, price, storeName, image, description, ...props }: ProductCardProps) {
  const defaultImage = '📦'

  return (
    <Link
      to={ROUTES.productDetail.replace(':productId', String(id))}
      className={cn(
        'bg-white rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200',
        props.className
      )}
    >
      <div className="relative h-48 bg-surface flex items-center justify-center text-6xl">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-6xl">{defaultImage}</span>
        )}
        <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
          {price}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-text mb-2 line-clamp-2 min-h-[2.5rem]">
          {name}
        </h3>

        <p className="text-sm text-text-muted mb-3 line-clamp-2">
          {description || `Do'kon: ${storeName}`}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs text-text-muted">{storeName}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">{price}</span>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <span>⭐</span>
              <span>4.5</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
