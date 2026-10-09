/**
 * Addresses feature module
 *
 * This feature handles address operations including:
 * - Listing addresses
 * - Creating addresses
 * - Updating addresses
 * - Deleting addresses
 * - Setting default address
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addressesService } from '@/services/addresses.service'

// Types (should be imported from @/types)
export interface Address {
  id: number
  village: string
  street: string
  home_number: string
  flat_number?: string
  is_default: boolean
  created_at: string
}

// Query key
export const addressesQueryKey = ['addresses'] as const

/**
 * Hook for listing user's addresses
 */
export function useAddresses() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: addressesQueryKey,
    queryFn: addressesService.list,
    retry: false,
  })

  return {
    addresses: data || [],
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for creating address
 */
export function useCreateAddress() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: addressesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressesQueryKey })
    },
    onError: (error) => {
      console.error('Failed to create address:', error)
    },
  })

  return mutation
}

/**
 * Hook for updating address
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      addressId,
      data,
    }: {
      addressId: number
      data: {
        home_number?: string
        flat_number?: string
        is_default?: boolean
      }
    }) => addressesService.update(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressesQueryKey })
    },
    onError: (error) => {
      console.error('Failed to update address:', error)
    },
  })

  return mutation
}

/**
 * Hook for deleting address
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: addressesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressesQueryKey })
    },
    onError: (error) => {
      console.error('Failed to delete address:', error)
    },
  })

  return mutation
}
