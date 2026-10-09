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
       { path: ROUTES.cart,        element: <ProtectedRoute><PageWrapper><CartPage /></PageWrapper></ProtectedRoute> },
       { path: ROUTES.orders,      element: <ProtectedRoute><PageWrapper><OrdersPage /></PageWrapper></ProtectedRoute> },
       { path: ROUTES.orderDetail, element: <ProtectedRoute><PageWrapper><OrderDetailPage /></PageWrapper></ProtectedRoute> },
       { path: ROUTES.profile,     element: <ProtectedRoute><PageWrapper><ProfilePage /></PageWrapper></ProtectedRoute> },
       { path: ROUTES.addresses,   element: <ProtectedRoute><PageWrapper><AddressesPage /></PageWrapper></ProtectedRoute> },
    ],
  },

  // ── Auth flow (AuthLayout — no bottom nav) ────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.login,    element: <PageWrapper><LoginPage /></PageWrapper> },
      { path: ROUTES.register, element: <PageWrapper><RegisterPage /></PageWrapper> },
       { path: ROUTES.checkout,     element: <ProtectedRoute><PageWrapper><CheckoutPage /></PageWrapper></ProtectedRoute> },
       { path: ROUTES.orderSuccess, element: <ProtectedRoute><PageWrapper><OrderSuccessPage /></PageWrapper></ProtectedRoute> },
    ],
  },

  // ── Seller (SellerLayout) ─────────────────────────────────────────────────
  {
    element: <SellerLayout />,
    children: [
       // Onboarding — any authenticated user (active store not required yet)
       {
         path: ROUTES.sellerOnboarding,
         element: <ProtectedRoute><PageWrapper><SellerOnboardingPage /></PageWrapper></ProtectedRoute>,
       },

       // Dashboard + management — requires auth AND an active store (SellerRoute)
       { path: ROUTES.seller,              element: <ProtectedRoute><SellerRoute><PageWrapper><SellerDashboardPage /></PageWrapper></SellerRoute></ProtectedRoute> },
       { path: ROUTES.sellerProducts,      element: <ProtectedRoute><SellerRoute><PageWrapper><SellerProductsPage /></PageWrapper></SellerRoute></ProtectedRoute> },
       { path: ROUTES.sellerProductCreate, element: <ProtectedRoute><SellerRoute><PageWrapper><SellerProductCreatePage /></PageWrapper></SellerRoute></ProtectedRoute> },
       { path: ROUTES.sellerProductEdit,   element: <ProtectedRoute><SellerRoute><PageWrapper><SellerProductEditPage /></PageWrapper></SellerRoute></ProtectedRoute> },
       { path: ROUTES.sellerOrders,        element: <ProtectedRoute><SellerRoute><PageWrapper><SellerOrdersPage /></PageWrapper></SellerRoute></ProtectedRoute> },
       { path: ROUTES.sellerOrderDetail,   element: <ProtectedRoute><SellerRoute><PageWrapper><SellerOrderDetailPage /></PageWrapper></SellerRoute></ProtectedRoute> },
       { path: ROUTES.sellerStatistics,    element: <ProtectedRoute><SellerRoute><PageWrapper><SellerStatisticsPage /></PageWrapper></SellerRoute></ProtectedRoute> },
       { path: ROUTES.sellerSettings,      element: <ProtectedRoute><SellerRoute><PageWrapper><SellerSettingsPage /></PageWrapper></SellerRoute></ProtectedRoute> },
    ],
  },

  // ── System ────────────────────────────────────────────────────────────────
  { path: ROUTES.notFound,     element: <PageWrapper><NotFoundPage /></PageWrapper> },
  { path: ROUTES.unauthorized, element: <PageWrapper><UnauthorizedPage /></PageWrapper> },

  // Catch-all → 404
  { path: '*', element: <PageWrapper><NotFoundPage /></PageWrapper> },
]
