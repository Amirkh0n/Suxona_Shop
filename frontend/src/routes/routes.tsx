/**
 * Lazy page components — one export per route.
 *
 * This file exports ONLY React components (lazy exotic components count as
 * components for the fast-refresh rule). The Suspense wrapper lives in
 * PageWrapper.tsx; the route config array lives in routeConfig.tsx.
 *
 * Replace each lazyPlaceholder() call with a real lazy import when the page
 * is implemented in a later phase:
 *
 *   Before:  export const HomePage = lazyPlaceholder('Home')
 *   After:   export const HomePage = lazy(() => import('@/pages/HomePage'))
 */
import { lazy } from 'react'
import { lazyPlaceholder } from './lazyPlaceholder'

// ── Public ──────────────────────────────────────────────────────────────────
export const HomePage          = lazy(() => import('@/pages/HomePage'))
export const SearchPage        = lazy(() => import('@/pages/SearchPage'))
export const ProductListPage   = lazy(() => import('@/pages/ProductListPage'))
export const StoresPage        = lazyPlaceholder('Stores')
export const StoreDetailPage   = lazyPlaceholder('Store Detail')
export const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
export const LoginPage = lazy(() => import('@/pages/LoginPage'))
export const RegisterPage = lazy(() => import('@/pages/RegisterPage'))

// ── Authenticated ────────────────────────────────────────────────────────────
export const CartPage = lazy(() => import('@/pages/CartPage'))
export const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
export const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage'))
export const OrdersPage = lazy(() => import('@/pages/OrdersPage'))
export const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'))
export const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
export const AddressesPage    = lazyPlaceholder('Addresses')

// ── Seller ───────────────────────────────────────────────────────────────────
export const SellerOnboardingPage    = lazyPlaceholder('Seller Onboarding')
export const SellerDashboardPage     = lazyPlaceholder('Seller Dashboard')
export const SellerProductsPage      = lazyPlaceholder('Seller Products')
export const SellerProductCreatePage = lazyPlaceholder('Create Product')
export const SellerProductEditPage   = lazyPlaceholder('Edit Product')
export const SellerOrdersPage        = lazyPlaceholder('Seller Orders')
export const SellerOrderDetailPage   = lazyPlaceholder('Seller Order Detail')
export const SellerStatisticsPage    = lazyPlaceholder('Seller Statistics')
export const SellerSettingsPage      = lazyPlaceholder('Seller Settings')

// ── System ───────────────────────────────────────────────────────────────────
export const NotFoundPage     = lazyPlaceholder('404 — Page Not Found')
export const UnauthorizedPage = lazyPlaceholder('Unauthorized')
