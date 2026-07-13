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
import { Placeholder } from '@/pages/Placeholder'

/** Creates a lazy component that renders a named Placeholder page. */
function lazyPlaceholder(name: string): React.LazyExoticComponent<() => React.ReactElement> {
  return lazy(
    (): Promise<{ default: () => React.ReactElement }> =>
      Promise.resolve({ default: () => <Placeholder name={name} /> }),
  )
}

// ── Public ──────────────────────────────────────────────────────────────────
export const HomePage          = lazyPlaceholder('Home')
export const SearchPage        = lazyPlaceholder('Search')
export const StoresPage        = lazyPlaceholder('Stores')
export const StoreDetailPage   = lazyPlaceholder('Store Detail')
export const ProductDetailPage = lazyPlaceholder('Product Detail')
export const CategoryPage      = lazyPlaceholder('Category')
export const LoginPage         = lazyPlaceholder('Login')
export const RegisterPage      = lazyPlaceholder('Register')

// ── Authenticated ────────────────────────────────────────────────────────────
export const CartPage         = lazyPlaceholder('Cart')
export const CheckoutPage     = lazyPlaceholder('Checkout')
export const OrderSuccessPage = lazyPlaceholder('Order Success')
export const OrdersPage       = lazyPlaceholder('Orders')
export const OrderDetailPage  = lazyPlaceholder('Order Detail')
export const ProfilePage      = lazyPlaceholder('Profile')
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
