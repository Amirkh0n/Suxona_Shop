/**
 * Stores feature module
 *
 * This feature handles store operations including:
 * - Listing stores
 * - Store detail view
 * - My store management
 */

import { useQuery } from '@tanstack/react-query'
import { storesService } from '@/services/stores.service'

// Types (should be imported from @/types)
export interface Store {
  id: number
  name: string
  description?: string
  logo?: string
  banner?: string
  phone: string
  telegram_username?: string
  status: string
  rating?: number
  product_count?: number
  delivery_price?: string
  address?: string
  created_at: string
}

// Query key
export const storesQueryKey = ['stores'] as const

/**
 * Hook for listing stores
 */
export function useStores(params?: {
  page?: number
  search?: string
}) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...storesQueryKey, params],
    queryFn: () => storesService.list(params),
    retry: false,
  })

  return {
    stores: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching store detail
 */
export function useStoreDetail(storeId: number) {
  const {
    data: store,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...storesQueryKey, 'detail', storeId],
    queryFn: () => storesService.getDetail(storeId),
    retry: false,
  })

  return {
    store,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching current user's store
 */
export function useMyStore() {
  const {
    data: store,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...storesQueryKey, 'my'],
    queryFn: () => storesService.getMyStore(),
    retry: false,
    enabled: false, // Only fetch when user is authenticated
  })

  return {
    store,
    isLoading,
    error,
    refetch,
  }
}
