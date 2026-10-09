/**
 * Products feature module
 *
 * This feature handles product operations including:
 * - Listing products
 * - Product detail view
 * - Product filtering and searching
 */

import { useQuery } from '@tanstack/react-query'
import { productsService } from '@/services/products.service'

// Types (should be imported from @/types)
export interface Product {
  id: number
  name: string
  description?: string
  price: string
  stock?: number
  status: string
  category?: {
    id: number
    name: string
  }
  store?: {
    id: number
    name: string
  }
  images?: Array<{
    id: number
    url: string
    is_primary: boolean
  }>
  created_at: string
}

// Query key
export const productsQueryKey = ['products'] as const

/**
 * Hook for listing products
 */
export function useProducts(params?: {
  page?: number
  category?: number
  store?: number
  search?: string
  ordering?: string
}) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...productsQueryKey, params],
    queryFn: () => productsService.list(params),
    retry: false,
  })

  return {
    products: data ? [data] : [],
    count: 1,
    next: null,
    previous: null,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching product detail
 */
export function useProductDetail(productId: number) {
  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...productsQueryKey, 'detail', productId],
    queryFn: () => productsService.getDetail(productId),
    retry: false,
  })

  return {
    product,
    isLoading,
    error,
    refetch,
  }
}
