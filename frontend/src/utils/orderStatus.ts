/**
 * Order status mapping utilities.
 *
 * Property 9: Order status mapping totality
 * Validates: Requirements 17.4
 *
 * For any value of OrderStatusEnum (PENDING, ACCEPTED, DELIVERING, COMPLETED,
 * CANCELLED, REJECTED), the status-to-display mapping returns a defined,
 * non-empty label/badge descriptor — the mapping is total over the enum.
 */
import type { OrderStatus } from '../types'

/**
 * Badge descriptor for order status display.
 */
export interface OrderStatusBadge {
  label: string
  variant: 'default' | 'success' | 'warning' | 'error' | 'info'
}

/**
 * Maps every OrderStatusEnum value to a defined, non-empty label/badge
 * descriptor.
 *
 * This function is total over the OrderStatusEnum. It must return a valid
 * badge for every possible status value.
 *
 * @param status - The order status from the backend (OrderStatusEnum)
 * @returns An OrderStatusBadge with label and variant
 */
export function orderStatusLabel(status: OrderStatus): OrderStatusBadge {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending',
        variant: 'warning',
      }
    case 'ACCEPTED':
      return {
        label: 'Accepted',
        variant: 'info',
      }
    case 'DELIVERING':
      return {
        label: 'Delivering',
        variant: 'info',
      }
    case 'COMPLETED':
      return {
        label: 'Completed',
        variant: 'success',
      }
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        variant: 'default',
      }
    case 'REJECTED':
      return {
        label: 'Rejected',
        variant: 'error',
      }
  }
}
