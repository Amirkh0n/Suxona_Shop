/**
 * Centralized TanStack Query key factory.
 *
 * A single factory prevents key drift and makes cache invalidation precise.
 * All query/mutation hooks must derive their keys from here rather than
 * inlining array literals.
 */
import type { ProductFilters, StoreFilters } from '@/types'

export const queryKeys = {
  banners: () => ['banners'] as const,
  categories: () => ['categories'] as const,

  products: (filters?: ProductFilters) => ['products', filters ?? {}] as const,
  product: (id: number) => ['product', id] as const,
  myProducts: () => ['products', 'my'] as const,

  stores: (filters?: StoreFilters) => ['stores', filters ?? {}] as const,
  store: (id: number) => ['store', id] as const,
  myStore: () => ['stores', 'my'] as const,
  storeDeliveryZones: (id: number) => ['store', id, 'delivery-zones'] as const,

  villages: () => ['villages'] as const,

  cart: () => ['cart'] as const,

  orders: () => ['orders', 'my'] as const,
  storeOrders: () => ['orders', 'store'] as const,
  order: (id: number) => ['order', id] as const,

  profile: () => ['profile'] as const,
  sellerApplication: () => ['seller-application'] as const,
} as const
