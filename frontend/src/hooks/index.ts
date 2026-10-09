/**
 * Common hooks for shared functionality
 */

import { useQuery } from '@tanstack/react-query'

// Banner queries
export function useBanners() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await fetch('/api/v1/banners/')
      if (!response.ok) throw new Error('Failed to fetch banners')
      return response.json()
    },
    retry: false,
  })

  return {
    banners: data || [],
    isLoading,
    error,
    refetch,
  }
}

// Category queries
export function useCategories() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/v1/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      return response.json()
    },
    retry: false,
  })

  return {
    categories: data || [],
    isLoading,
    error,
    refetch,
  }
}

// Cart queries
export function useCart() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await fetch('/api/v1/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch cart')
      return response.json()
    },
    retry: false,
  })

  return {
    cart: data,
    isLoading,
    error,
    refetch,
  }
}
