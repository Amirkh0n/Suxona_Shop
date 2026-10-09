/**
 * StoreCard component
 *
 * Displays a store in a card format for store listings and details pages.
 */

import { Link } from 'react-router-dom'
import type { Store } from '@/types'
import { ROUTES } from '@/routes/paths'
import { cn } from '@/utils/cn'

export interface StoreCardProps extends Omit<Store, 'id'> {
  id: number
  className?: string
  rating?: number
  productCount?: number
  deliveryInfo?: string
}

export function StoreCard({ id, name, logo, status, ...props }: StoreCardProps) {
  const defaultLogo = '🏪'

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    suspended: 'bg-red-100 text-red-700',
  }

  const statusLabels: Record<string, string> = {
    active: 'Faol',
    pending: 'Kutilmoqda',
    suspended: 'To\'xtatilgan',
  }

  return (
    <Link
      to={ROUTES.storeDetail.replace(':storeId', String(id))}
      className={cn(
        'bg-white rounded-lg border border-border p-4 hover:shadow-md transition-all duration-200',
        props.className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-5xl">{logo || defaultLogo}</div>
        <span className={cn('text-xs px-2 py-1 rounded-full', statusColors[status] || statusColors.pending)}>
          {statusLabels[status] || status}
        </span>
      </div>

      <h3 className="font-semibold text-text mb-1 line-clamp-1">{name}</h3>

      <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
        <span>•</span>
        <span>{props.deliveryInfo || 'Yetkazib berish: bepul'}</span>
      </div>

      <div className="flex gap-2">
        <Link
          to={ROUTES.storeDetail.replace(':storeId', String(id))}
          className="flex-1 text-center text-sm font-medium text-primary hover:text-primary-hover py-2 border border-primary rounded-lg hover:bg-primary hover:bg-opacity-5 transition-colors"
        >
          Ko‘rish
        </Link>
      </div>
    </Link>
  )
}

export default StoreCard
