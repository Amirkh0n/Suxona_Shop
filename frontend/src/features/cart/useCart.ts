/**
 * Cart feature module
 *
 * This feature handles cart operations including:
 * - Adding items to cart
 * - Updating cart item quantities
 * - Removing items from cart
 * - Clearing cart
 * - Cart data fetching
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartService } from '@/services/cart.service'

// Types
export interface CartItem {
  id: number
  product: {
    id: number
    name: string
    price: string
    description?: string
    image?: string
  }
  quantity: number
  subtotal: string
}

export interface CartStoreGroup {
  store_id: number
  store_name: string
  items: any[]
  delivery_price: string
  subtotal: string
  total: string
}

export interface Cart {
  cart_id: number
  total_items?: number
  total_quantity?: number
  stores: CartStoreGroup[]
  total: string
}

// Query key
export const cartQueryKey = ['cart'] as const

/**
 * Hook for fetching cart data
 */
export function useCart() {
  const queryClient = useQueryClient()

  const {
    data: cart,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: cartQueryKey,
    queryFn: cartService.getCart,
    retry: false,
  })

  // Add item mutation
  const addItem = useMutation({
    mutationFn: async (data: { productId: number; quantity: number }) =>
      cartService.addItem(data.productId, data.quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
    onError: (error: any) => {
      console.error('Failed to add item to cart:', error)
    },
  })

  // Update item mutation
  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartService.updateItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
    onError: (error) => {
      console.error('Failed to update cart item:', error)
    },
  })

  // Remove item mutation
  const removeItem = useMutation({
    mutationFn: cartService.removeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
    onError: (error) => {
      console.error('Failed to remove item from cart:', error)
    },
  })

  // Clear cart mutation
  const clearCart = useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
    onError: (error) => {
      console.error('Failed to clear cart:', error)
    },
  })

  return {
    // Data
    cart,
    isLoading,
    isRefetching,
    error,

    // Mutations
    addItem,
    updateItem,
    removeItem,
    clearCart,

    // Helpers
    refetch,
    totalItems: (cart as any)?.total_items || 0,
    totalQuantity: (cart as any)?.total_quantity || 0,
    total: (cart as any)?.total || '0',
  }
}
