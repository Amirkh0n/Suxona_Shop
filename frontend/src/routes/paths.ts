/**
 * Central route-path definitions. Components and guards must reference these
 * constants rather than hardcoding path strings (development rule).
 *
 * Routing uses ID-based params for the MVP (approved decision): `/store/:storeId`
 * and `/product/:productId` map to the integer identifiers exposed by the schema
 * (the backend has no slug field).
 */

/** Static route paths. */
export const ROUTES = {
  // Public
  home: '/',
  search: '/search',
  stores: '/stores',
  storeDetail: '/store/:storeId',
  productDetail: '/product/:productId',
  category: '/category/:slug',
  login: '/login',
  register: '/register',

  // Authenticated
  cart: '/cart',
  checkout: '/checkout/:storeId',
  orderSuccess: '/order-success/:orderId',
  orders: '/orders',
  orderDetail: '/orders/:orderId',
  profile: '/profile',
  addresses: '/addresses',

  // Seller
  seller: '/seller',
  sellerOnboarding: '/seller/onboarding',
  sellerProducts: '/seller/products',
  sellerProductCreate: '/seller/products/create',
  sellerProductEdit: '/seller/products/:productId/edit',
  sellerOrders: '/seller/orders',
  sellerOrderDetail: '/seller/orders/:orderId',
  sellerStatistics: '/seller/statistics',
  sellerSettings: '/seller/settings',

  // System
  notFound: '/404',
  unauthorized: '/unauthorized',
} as const

/**
 * Builders for parameterized routes. Using these keeps navigation type-safe and
 * consistent with the ID-based routing decision.
 */
export const buildPath = {
  storeDetail: (storeId: number | string) => `/store/${storeId}`,
  productDetail: (productId: number | string) => `/product/${productId}`,
  category: (slug: string) => `/category/${slug}`,
  checkout: (storeId: number | string) => `/checkout/${storeId}`,
  orderSuccess: (orderId: number | string) => `/order-success/${orderId}`,
  orderDetail: (orderId: number | string) => `/orders/${orderId}`,
  sellerProductEdit: (productId: number | string) =>
    `/seller/products/${productId}/edit`,
  sellerOrderDetail: (orderId: number | string) => `/seller/orders/${orderId}`,
} as const
