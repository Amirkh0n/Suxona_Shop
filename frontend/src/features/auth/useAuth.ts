/**
 * Auth feature module
 *
 * This feature handles authentication operations including:
 * - Login
 * - Registration
 * - User data fetching
 * - Token refresh
 * - Logout
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'

// Types
export interface User {
  id: number
  phone: string
  first_name: string
  last_name: string
  telegram_account: {
    id: number
    telegram_id: number
    username: string
  } | null
  is_active: boolean
  created_at: string
}

// Query key
export const userQueryKey = ['user'] as const
export const tokenQueryKey = ['token'] as const

/**
 * Hook for fetching current user
 */
export function useCurrentUser() {
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: userQueryKey,
    queryFn: authService.getCurrentUser,
    retry: false,
  })

  return {
    user,
    isLoading,
    error,
    refetch,
    isAuthenticated: !!user && user.is_active,
  }
}

/**
 * Hook for login
 */
export function useLogin() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('refreshToken', data.refresh)

      // Update token in authStore
      queryClient.setQueryData(tokenQueryKey, { access: data.access, refresh: data.refresh })

      // Invalidate user query
      queryClient.invalidateQueries({ queryKey: userQueryKey })
    },
    onError: (error) => {
      console.error('Login failed:', error)
      throw error
    },
  })

  return mutation
}

/**
 * Hook for registration
 */
export function useRegister() {
  const mutation = useMutation({
    mutationFn: authService.register,
    onError: (error) => {
      console.error('Registration failed:', error)
      throw error
    },
  })

  return mutation
}

/**
 * Hook for token refresh
 */
export function useTokenRefresh() {
  const queryClient = useQueryClient()
  const refreshToken = localStorage.getItem('refreshToken')

  const mutation = useMutation({
    mutationFn: () => authService.refreshTokens(refreshToken || ''),
    onSuccess: (data) => {
      // Store new access token
      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('refreshToken', data.refresh)

      // Update token in authStore
      queryClient.setQueryData(tokenQueryKey, { access: data.access, refresh: data.refresh })

      // Invalidate user query
      queryClient.invalidateQueries({ queryKey: userQueryKey })
    },
    onError: (error) => {
      console.error('Token refresh failed:', error)
      // Clear tokens on error
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      queryClient.setQueryData(tokenQueryKey, null)
      queryClient.setQueryData(userQueryKey, null)
      throw error
    },
  })

  return mutation
}

/**
 * Hook for logout
 */
export function useLogout() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => {
      // For JWT, we don't need to do anything on the server
      return Promise.resolve()
    },
    onSuccess: () => {
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')

      // Clear tokens from query cache
      queryClient.setQueryData(tokenQueryKey, null)
      queryClient.setQueryData(userQueryKey, null)

      // Invalidate all queries
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      console.error('Logout error:', error)
    },
  })

  return mutation
}

/**
 * Hook for checking if user is authenticated
 */
export function useIsAuthenticated() {
  const { user } = useCurrentUser()
  return user?.is_active ?? false
}

/**
 * Hook for getting access token
 */
export function useAccessToken() {
  const accessToken = localStorage.getItem('accessToken')
  return accessToken
}
