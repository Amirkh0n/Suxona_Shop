/**
 * TanStack Query client configuration.
 *
 * Design defaults (from the spec):
 *   staleTime          5 min  — data is considered fresh for 5 minutes.
 *   gcTime            10 min  — unused cache is garbage-collected after 10 min.
 *   refetchOnWindowFocus false — Telegram users switch apps frequently;
 *                               avoid unnecessary refetches on focus.
 *   retry              1      — one automatic retry on transient failures.
 *
 * The QueryClient is created once here and imported by the providers
 * component so the same instance is shared across the entire app.
 *
 * All server state (products, stores, cart, orders, profile, etc.) lives
 * exclusively in TanStack Query — never in Zustand.
 */
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 minutes
      gcTime: 10 * 60 * 1000,     // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      // Mutations do not retry by default — side effects should not be
      // repeated automatically.
      retry: 0,
    },
  },
})
