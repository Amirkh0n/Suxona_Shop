/**
 * Orders feature module
 *
 * This feature handles order operations including:
 * - Creating orders
 * - Listing user orders
 * - Viewing order details
 * - Canceling orders
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersService } from '@/services/orders.service'

// Types
export interface OrderItem {
  id: number
  product: {
    id: number
    name: string
    price: string
    image?: string
  }
  quantity: number
  price: string
  subtotal: string
}

export interface Order {
  id: number
  customer: {
    id: number
    phone: string
    first_name: string
    last_name: string
  }
  store: {
    id: number
    name: string
  }
  address: {
    id: number
    village: string
    street: string
    home_number: string
    flat_number?: string
  }
  delivery_price: string
  subtotal: string
  total: string
  status: string
  note?: string
  items: OrderItem[]
  created_at: string
  status_history?: Array<{
    status: string
    created_at: string
  }>
}

// Query key
export const ordersQueryKey = ['orders'] as const

/**
 * Hook for fetching user's orders
 */
export function useOrders(params?: { page?: number; status?: string }) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...ordersQueryKey, params],
    queryFn: () => ordersService.listMyOrders(params),
    retry: false,
  })

  return {
    orders: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching order detail
 */
export function useOrderDetail(orderId: number) {
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...ordersQueryKey, 'detail', orderId],
    queryFn: () => ordersService.getOrderDetail(orderId),
    retry: false,
  })

  return {
    order,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for canceling order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ordersService.cancelOrder,
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({
        queryKey: [...ordersQueryKey, 'detail', orderId],
      })
      queryClient.invalidateQueries({ queryKey: ordersQueryKey })
    },
    onError: (error) => {
      console.error('Failed to cancel order:', error)
    },
  })

  return mutation
}
