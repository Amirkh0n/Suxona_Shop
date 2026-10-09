/**
 * Feature-facing type aliases derived from the generated OpenAPI schema.
 *
 * `schema.d.ts` is generated from `backend/schema.yml` (the single source of
 * truth) via `npm run generate:api`. Never edit it by hand. These aliases give
 * the rest of the app ergonomic names without coupling to the generated shape.
 *
 * Note: all money fields (price, subtotal, total, delivery_price) are decimal
 * strings in the schema and must be treated as strings in transport.
 */
import type { components } from './schema'

type Schemas = components['schemas']

/* ----------------------------- Auth & users ----------------------------- */
export type User = Schemas['UserDetail']
export type UserCompact = Schemas['UserCompact']
export type TokenPair = Schemas['TokenPair']
export type Login = Schemas['Login']
export type LoginCredentials = {
  phone: string
  password: string
}
export type Register = Schemas['Register']
export type RegisterResponse = Schemas['RegisterResponse']
export type RegisterCredentials = Schemas['Register']
export type TelegramAccount = Schemas['TelegramAccount']
export type VerificationResponse = {
  user: User
  access_token: string
  refresh_token: string
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type ProductListResponse = Schemas['ProductList']

/* ------------------------------- Products -------------------------------- */
export type Product = Schemas['ProductDetail']
export type ProductSummary = Schemas['ProductList']
export type ProductImage = Schemas['ProductImage']

/* -------------------------------- Stores --------------------------------- */
export type Store = Schemas['StoreDetail']
export type StoreSummary = Schemas['StoreList']

/* ------------------------------ Categories ------------------------------- */
export type Category = Schemas['Category']

/* --------------------------------- Cart ---------------------------------- */
export type Cart = Schemas['CartResponse']
export type CartStoreGroup = Schemas['CartStoreGroupResponse']
export type CartItem = Schemas['CartItem']

/* -------------------------------- Orders --------------------------------- */
export type Order = Schemas['OrderDetail']
export type OrderSummary = Schemas['OrderList']
export type OrderItem = Schemas['OrderItem']
export type OrderStatus = Schemas['OrderStatusEnum']

/* --------------------------- Store applications -------------------------- */
export type StoreApplication = Schemas['StoreApplicationDetail']
export type StoreApplicationStatus = Schemas['StoreApplicationStatusEnum']

/* ------------------------- Addresses & locations ------------------------- */
export type Address = Schemas['AddressDetail']
export type Village = Schemas['Village']
export type DeliveryZone = Schemas['DeliveryZoneList']

/* -------------------------------- Banners -------------------------------- */
export type Banner = Schemas['BannerList']

/* ------------------------------- App-level ------------------------------- */

/**
 * Standardized, user-facing error shape. Every failure that reaches the UI is
 * normalized into this (see src/utils/normalizeError.ts in a later phase).
 * `status` is the HTTP status, or 0 for network/offline failures.
 */
export interface AppError {
  message: string
  status: number
}

/** Filters accepted by the product list endpoint (`GET /api/v1/products`). */
export interface ProductFilters {
  category?: number
  store?: number
  search?: string
}

/** Filters accepted by the store list endpoint (`GET /api/v1/stores`). */
export interface StoreFilters {
  search?: string
}

/** Generic page-number paginated list envelope returned by list endpoints. */
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
