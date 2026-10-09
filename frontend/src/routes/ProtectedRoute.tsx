/**
 * ProtectedRoute component
 *
 * Wraps protected routes and checks for authentication.
 */

import { Navigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { ROUTES } from '@/routes/paths'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { telegramMode, isUserAuthenticated, isUserLoading } = useAppStore.getState()

  // Check if user is authenticated
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

  if (!isUserAuthenticated && !telegramMode) {
    return <Navigate to={ROUTES.login} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
