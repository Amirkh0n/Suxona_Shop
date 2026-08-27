/**
 * Route configuration array.
 *
 * Assembles the RouteObject[] tree from:
 *   - Layout components   (AppLayout, AuthLayout, SellerLayout)
 *   - Guard components    (ProtectedRoute, SellerRoute)
 *   - Page components     (lazy, from routes.tsx)
 *   - Suspense wrapper    (PageWrapper, from PageWrapper.tsx)
 *   - Path constants      (ROUTES, from paths.ts)
 *
 * The browser router instance is created in router.ts.
 * Lazy page components live in routes.tsx (components-only).
 * The Suspense wrapper lives in PageWrapper.tsx (components-only).
 *
 * Route groups:
 *   Public        — accessible without authentication, AppLayout (bottom nav)
 *   Authenticated — requires login, AppLayout
 *   Auth flow     — login / register / checkout / order-success, AuthLayout
 *   Seller        — onboarding (auth only) + dashboard (auth + active store)
 *   System        — 404, unauthorized, catch-all
 */
import type { RouteObject } from 'react-router-dom'

import { AppLayout }      from '@/layouts/AppLayout'
import { AuthLayout }     from '@/layouts/AuthLayout'
import { SellerLayout }   from '@/layouts/SellerLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { SellerRoute }    from './SellerRoute'
import { ROUTES }         from './paths'
import { PageWrapper }    from './PageWrapper'
import {
  HomePage, SearchPage, StoresPage, StoreDetailPage,
  ProductDetailPage, ProductListPage,
  LoginPage, RegisterPage,
  CartPage, CheckoutPage, OrderSuccessPage,
  OrdersPage, OrderDetailPage, ProfilePage, AddressesPage,
  SellerOnboardingPage, SellerDashboardPage,
  SellerProductsPage, SellerProductCreatePage, SellerProductEditPage,
  SellerOrdersPage, SellerOrderDetailPage,
  SellerStatisticsPage, SellerSettingsPage,
  NotFoundPage, UnauthorizedPage,
} from './routes'

export const routeConfig: RouteObject[] = [
  // ── Public + Authenticated (AppLayout — bottom nav visible) ─────────────
  {
    element: <AppLayout />,
    children: [
      { path: ROUTES.home,          element: <PageWrapper><HomePage /></PageWrapper> },
      { path: ROUTES.search,        element: <PageWrapper><SearchPage /></PageWrapper> },
      { path: ROUTES.catalog,       element: <PageWrapper><ProductListPage /></PageWrapper> },
      { path: ROUTES.stores,        element: <PageWrapper><StoresPage /></PageWrapper> },
      { path: ROUTES.storeDetail,   element: <PageWrapper><StoreDetailPage /></PageWrapper> },
      { path: ROUTES.productDetail, element: <PageWrapper><ProductDetailPage /></PageWrapper> },

      // Authenticated routes nested under ProtectedRoute
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.cart,        element: <PageWrapper><CartPage /></PageWrapper> },
          { path: ROUTES.orders,      element: <PageWrapper><OrdersPage /></PageWrapper> },
          { path: ROUTES.orderDetail, element: <PageWrapper><OrderDetailPage /></PageWrapper> },
          { path: ROUTES.profile,     element: <PageWrapper><ProfilePage /></PageWrapper> },
          { path: ROUTES.addresses,   element: <PageWrapper><AddressesPage /></PageWrapper> },
        ],
      },
    ],
  },

  // ── Auth flow (AuthLayout — no bottom nav) ────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.login,    element: <PageWrapper><LoginPage /></PageWrapper> },
      { path: ROUTES.register, element: <PageWrapper><RegisterPage /></PageWrapper> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.checkout,     element: <PageWrapper><CheckoutPage /></PageWrapper> },
          { path: ROUTES.orderSuccess, element: <PageWrapper><OrderSuccessPage /></PageWrapper> },
        ],
      },
    ],
  },

  // ── Seller (SellerLayout) ─────────────────────────────────────────────────
  {
    element: <SellerLayout />,
    children: [
      // Onboarding — any authenticated user (active store not required yet)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: ROUTES.sellerOnboarding,
            element: <PageWrapper><SellerOnboardingPage /></PageWrapper>,
          },
        ],
      },

      // Dashboard + management — requires auth AND an active store (SellerRoute)
      {
        element: <SellerRoute />,
        children: [
          { path: ROUTES.seller,              element: <PageWrapper><SellerDashboardPage /></PageWrapper> },
          { path: ROUTES.sellerProducts,      element: <PageWrapper><SellerProductsPage /></PageWrapper> },
          { path: ROUTES.sellerProductCreate, element: <PageWrapper><SellerProductCreatePage /></PageWrapper> },
          { path: ROUTES.sellerProductEdit,   element: <PageWrapper><SellerProductEditPage /></PageWrapper> },
          { path: ROUTES.sellerOrders,        element: <PageWrapper><SellerOrdersPage /></PageWrapper> },
          { path: ROUTES.sellerOrderDetail,   element: <PageWrapper><SellerOrderDetailPage /></PageWrapper> },
          { path: ROUTES.sellerStatistics,    element: <PageWrapper><SellerStatisticsPage /></PageWrapper> },
          { path: ROUTES.sellerSettings,      element: <PageWrapper><SellerSettingsPage /></PageWrapper> },
        ],
      },
    ],
  },

  // ── System ────────────────────────────────────────────────────────────────
  { path: ROUTES.notFound,     element: <PageWrapper><NotFoundPage /></PageWrapper> },
  { path: ROUTES.unauthorized, element: <PageWrapper><UnauthorizedPage /></PageWrapper> },

  // Catch-all → 404
  { path: '*', element: <PageWrapper><NotFoundPage /></PageWrapper> },
]
