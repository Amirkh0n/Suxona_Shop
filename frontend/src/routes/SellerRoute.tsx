/**
 * SellerRoute component
 *
 * Wraps seller-only routes and checks for seller permissions.
 */

import { Navigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { ROUTES } from '@/routes/paths'

interface SellerRouteProps {
  children: React.ReactNode
}

export function SellerRoute({ children }: SellerRouteProps) {
  const { telegramMode, isUserSeller, isUserLoading } = useAppStore.getState()

  // Check if user is loading
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-text-muted">Tizimni tekshirmoqda...</p>
        </div>
      </div>
    )
  }

  // In Telegram mode, users can access seller routes if they are sellers
  if (telegramMode) {
    if (isUserSeller) {
      return <>{children}</>
    }
    return <Navigate to={ROUTES.home} replace />
  }

  // In web mode, check if user is authenticated and is a seller
  if (!isUserSeller) {
    return <Navigate to={ROUTES.home} replace />
  }

  return <>{children}</>
}

export default SellerRoute
