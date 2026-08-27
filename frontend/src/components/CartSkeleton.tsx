/**
 * CartSkeleton — Loading state for Cart page
 *
 * Shows 2 store groups with shimmer animation
 *
 * Phase 3A: UI only
 */
export function CartSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2].map((storeIndex) => (
        <div key={storeIndex} className="rounded-2xl bg-white p-4 shadow-sm">
          {/* Store Header Skeleton */}
          <div className="mb-4 flex items-center gap-3">
            <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-xl bg-surface" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-surface" />
              <div className="h-3 w-20 animate-pulse rounded bg-surface" />
            </div>
          </div>

          {/* Cart Items Skeleton */}
          <div className="mb-4 space-y-3">
            {[1, 2].map((itemIndex) => (
              <div key={itemIndex} className="flex gap-3 rounded-2xl bg-white p-3">
                <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-xl bg-surface" />
                <div className="flex flex-1 flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-surface" />
                    <div className="h-4 w-24 animate-pulse rounded bg-surface" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-24 animate-pulse rounded-lg bg-surface" />
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-surface" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Skeleton */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-surface" />
              <div className="h-4 w-20 animate-pulse rounded bg-surface" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-20 animate-pulse rounded bg-surface" />
              <div className="h-4 w-24 animate-pulse rounded bg-surface" />
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <div className="h-5 w-16 animate-pulse rounded bg-surface" />
              <div className="h-5 w-28 animate-pulse rounded bg-surface" />
            </div>
          </div>

          {/* Checkout Button Skeleton */}
          <div className="mt-4 h-12 w-full animate-pulse rounded-xl bg-surface" />
        </div>
      ))}
    </div>
  )
}
