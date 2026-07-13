/**
 * SellerRoute — requires authentication AND an active store.
 *
 * Phase 3 integration point:
 *   The active-store check currently uses a stub that always returns
 *   `hasActiveStore = false`, routing all authenticated users to onboarding.
 *   In Phase 3, replace `useActiveStoreStub` with the real `useMyStore` hook
 *   that calls `GET /api/v1/stores/my` via the store service.
 *
 *   TODO Phase 3: swap stub → import { useMyStore } from '@/features/store/hooks/useMyStore'
 *
 * Decision logic lives in src/utils/sellerAccess.ts (pure, property-tested).
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { canAccessSellerRoutes } from '@/utils/sellerAccess'
import { ROUTES } from './paths'

// ---------------------------------------------------------------------------
// Phase 3 stub — replace with the real hook once the store service exists.
// ---------------------------------------------------------------------------

/** Temporary stub returning the shape that Phase 3 will provide via
 *  useQuery(queryKeys.myStore()). */
function useActiveStoreStub(): {
  isLoading: boolean
  hasActiveStore: boolean
} {
  // TODO Phase 3: replace with:
  //   const { data, isLoading } = useMyStore()
  //   return { isLoading, hasActiveStore: data !== undefined }
  return { isLoading: false, hasActiveStore: false }
}

// ---------------------------------------------------------------------------

export function SellerRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  const { isLoading, hasActiveStore } = useActiveStoreStub()

  // While the active-store status is being resolved, show nothing (Phase 3
  // will swap this for a skeleton loader).
  if (isLoading) {
    return null
  }

  const decision = canAccessSellerRoutes({ isAuthenticated, hasActiveStore })

  if (decision === 'REDIRECT_LOGIN') {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }

  if (decision === 'REDIRECT_ONBOARDING') {
    return (
      <Navigate to={ROUTES.sellerOnboarding} state={{ from: location }} replace />
    )
  }

  return <Outlet />
}
