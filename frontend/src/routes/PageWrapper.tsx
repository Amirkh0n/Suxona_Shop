/**
 * PageWrapper — Suspense wrapper used by the route config.
 *
 * Exports two things that routeConfig.tsx uses when building route elements:
 *   PageLoader — the fallback shown while a lazy page loads (Req 27.4)
 *   PageWrapper — wraps any element in a Suspense boundary
 *
 * Kept in its own file so routes.tsx can export only lazy page components
 * (satisfying the react-refresh/only-export-components rule).
 */
import { Suspense, type ReactElement } from 'react'

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="text-sm text-text-muted">Loading…</span>
    </div>
  )
}

interface PageWrapperProps {
  children: ReactElement
}

export function PageWrapper({ children }: PageWrapperProps) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}
