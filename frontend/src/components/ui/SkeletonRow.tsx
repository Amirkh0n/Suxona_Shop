/**
 * SkeletonRow component
 *
 * Provides a skeleton for table rows.
 */

import { Skeleton } from './Skeleton'

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-4 px-4 border-b border-border last:border-0">
      <Skeleton width="40%" height="1rem" />
      <Skeleton width="20%" height="1rem" />
      <Skeleton width="15%" height="1rem" />
      <Skeleton width="10%" height="1rem" />
    </div>
  )
}

export default SkeletonRow
