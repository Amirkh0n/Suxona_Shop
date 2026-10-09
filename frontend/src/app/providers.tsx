/**
 * Application providers — composes all top-level context providers.
 *
 * Mounting order (outer → inner):
 *   ToastProvider      manages toast notifications
 *   ErrorBoundary      catches render-time exceptions
 *   QueryClientProvider  owns all server state
 *   RouterProvider     owns routing (reads from the pre-built router)
 *
 * Providers are separated from main.tsx so they can be imported in tests
 * without triggering the bootstrap side-effects.
 */
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'
import { ToastProvider } from './ToastProvider'
import { queryClient } from './queryClient'
import { router } from '@/routes/router'

export function AppProviders() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
