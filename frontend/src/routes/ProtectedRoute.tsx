/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 *
 * Reads isAuthenticated directly from authStore (Zustand client state).
 * No server request is made here — the auth state is already resolved from
 * the persisted localStorage session on app boot.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from './paths'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    // Pass the attempted location so login can redirect back after auth.
    return (
      <Navigate to={ROUTES.login} state={{ from: location }} replace />
    )
  }

  return <Outlet />
}
