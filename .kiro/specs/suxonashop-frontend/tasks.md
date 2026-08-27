# Implementation Plan: SuxonaShop Frontend

## Overview

This plan converts the SuxonaShop Frontend design into incremental, dependency-ordered coding tasks for a React + TypeScript + Vite mobile-first marketplace optimized for Telegram Mini Apps. The backend already exists; `backend/schema.yml` is the single source of truth, and TypeScript types are generated from it via `openapi-typescript`. The `frontend/` project does not exist yet and is scaffolded in the first epic.

The plan is test-driven for the pure-logic layer: the 12 correctness properties from the design are implemented as fast-check property-based tests written alongside the utilities they validate. Property-based test sub-tasks are tagged with their property number and the requirement clause they validate, and are marked optional (`*`) per the workflow's testing conventions. Each task builds on the previous and ends by wiring features into the route tree and providers so no orphaned code remains.

All tasks assume the project root is `frontend/` (the working directory). Paths below are relative to `frontend/`.

## Tasks

- [x] 1. Scaffold the Vite + React + TypeScript project and tooling
  - [x] 1.1 Initialize Vite React-TS project and dependencies
    - Scaffold a Vite `react-ts` project in `frontend/` with `package.json`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts`
    - Add runtime deps: `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `zustand`, `axios`, `react-hook-form`, `zod`, `@telegram-apps/sdk` (or raw `window.Telegram` typings)
    - Add dev deps: `typescript`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `openapi-typescript`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `fast-check`, `eslint`, `prettier`
    - Configure `tsconfig.json` with `strict: true` and `noImplicitAny`, ban `any` via ESLint
    - _Requirements: 1.6_
    - _Design: Technology Stack; Project Structure_

  - [x] 1.2 Configure Tailwind with design-system tokens
    - Create `tailwind.config.ts` extending theme with the design tokens (primary `#22C55E`/hover `#16A34A`, background, surface, border, text/text-muted, success/warning/error), borderRadius (sm 8, md 12, lg 16, xl 24), Inter font family, and spacing scale (4,8,12,16,20,24,32,40,48,64)
    - Configure responsive breakpoints targeting 320/375/768/1280px with centered max width 1280px
    - Create `postcss.config.js` and `src/index.css` with Tailwind directives
    - _Requirements: 27.1, 28.4_
    - _Design: Design System Tokens (Tailwind Theme); Performance_

  - [x] 1.3 Configure ESLint, Prettier, and environment variables
    - Add ESLint config enforcing no-`any`, functional-components-only, and import-layering conventions
    - Add Prettier config and align with ESLint
    - Create `.env.example` and typed `import.meta.env` declaration for `VITE_API_URL` in `src/vite-env.d.ts`
    - _Requirements: 1.3, 1.6_
    - _Design: Axios Instance; Technology Stack_

  - [x] 1.4 Create the feature-based folder structure
    - Create empty `src/{app,pages,features,components/ui,services,hooks,stores,types,utils,routes,layouts,assets,constants}` directories with `index.ts` placeholders where helpful
    - _Requirements: 1.4, 1.5_
    - _Design: Project Structure; What Lives Where_

  - [x] 1.5 Add the schema type-generation script and generate schema types
    - Add npm script `"generate:api": "openapi-typescript ../backend/schema.yml -o src/types/schema.d.ts"`
    - Run it to produce committed `src/types/schema.d.ts` exposing `components["schemas"][...]`
    - _Requirements: 1.2_
    - _Design: Type Generation Workflow_

  - [x] 1.6 Configure the Vitest + Testing Library + fast-check test harness
    - Create `vitest.config.ts` (jsdom environment, globals, setup file) and `src/test/setup.ts` importing `@testing-library/jest-dom`
    - Add npm scripts `"test": "vitest --run"` and `"test:watch": "vitest"`
    - Add a trivial smoke test to confirm the harness, RTL, and fast-check all load
    - _Requirements: (test infrastructure for all property/unit/component tests)_
    - _Design: Testing Strategy; Property Test Configuration_

- [x] 2. Define shared types, constants, and domain aliases
  - [x] 2.1 Create feature-facing type aliases from the generated schema
    - In `src/types/*.ts`, alias generated schema types to ergonomic names: `User`, `UserCompact`, `TokenPair`, `Product`, `ProductSummary`, `ProductImage`, `Store`, `StoreSummary`, `Category`, `Cart`, `CartStoreGroup`, `CartItem`, `Order`, `OrderSummary`, `OrderItem`, `OrderStatus`, `StoreApplication`, `StoreApplicationStatus`, `Address`, `Village`, `DeliveryZone`, `Banner`
    - Define the `AppError { message: string; status: number }` type and `ProductFilters`/`StoreFilters`/`Paginated<T>` helper types
    - Treat all money fields as decimal strings
    - _Requirements: 1.2, 1.6, 17.4, 20.2_
    - _Design: Data Models; Representative Interface Snippets_

  - [x] 2.2 Create the central route-path constants
    - Create `src/routes/paths.ts` with all public, authenticated, seller, and system path constants and id-based params (`/store/:storeId`, `/product/:id`)
    - _Requirements: 6.5_
    - _Design: Central Route Definitions; Route Parameter Strategy: slug vs id_

  - [x] 2.3 Create the central query key factory
    - Create `src/constants/queryKeys.ts` with the `queryKeys` factory (banners, categories, products, product, myProducts, stores, store, myStore, storeDeliveryZones, villages, cart, orders, storeOrders, order, profile, sellerApplication)
    - _Requirements: 26.4_
    - _Design: Centralized Query Key Factory_

  - [x] 2.4 Mirror design tokens for non-Tailwind use
    - Create `src/constants/tokens.ts` exporting color/spacing/radius tokens for programmatic (non-class) usage
    - _Requirements: 27.1, 28.4_
    - _Design: Design System Tokens_

- [ ] 3. Implement pure-logic utilities with property-based tests
  - [ ] 3.1 Implement `normalizeError`
    - In `src/utils/normalizeError.ts`, map Axios errors carrying a `Detail` body, network/offline failures (status `0`), and unknown thrown values to `AppError` with a non-empty user-friendly message and a numeric status; map known statuses (401/403/404/409/network) to friendly copy; never expose raw payloads or stack traces
    - _Requirements: 24.1, 24.2, 15.6, 16.6, 19.6_
    - _Design: Standardized Error Shape and Normalization; Error Handling_

  - [ ]* 3.2 Write property test for `normalizeError`
    - **Property 10: Error normalization**
    - **Validates: Requirements 15.6, 16.6, 19.6, 24.1, 24.2**
    - Tag: `// Feature: suxonashop-frontend, Property 10: ...`; min 100 iterations

  - [ ] 3.3 Implement `groupCartByStore`
    - In `src/utils/cart.ts`, derive the store-grouped view from a `Cart` response such that the union of groups equals all items, each item belongs to exactly one group, and each group key matches its items' store
    - _Requirements: 14.2_
    - _Design: Pure-Logic Utilities; Cart Is Server-Side State_

  - [ ]* 3.4 Write property test for `groupCartByStore`
    - **Property 7: Cart store-grouping partition invariant**
    - **Validates: Requirements 14.2**
    - Tag with property number; min 100 iterations

  - [ ] 3.5 Implement `removeStoreGroup`
    - In `src/utils/cart.ts`, given a cart and a checked-out store id, return a cart with no items belonging to that store and all other stores' items unchanged
    - _Requirements: 16.3_
    - _Design: Per-Store Checkout and Cart Invalidation Flow_

  - [ ]* 3.6 Write property test for `removeStoreGroup`
    - **Property 8: Per-store checkout removal invariant**
    - **Validates: Requirements 16.3**
    - Tag with property number; min 100 iterations

  - [ ] 3.7 Implement `selectScreenState`
    - In `src/utils/screenState.ts`, return exactly one of `LOADING | ERROR | EMPTY | SUCCESS` following precedence loading → error → empty → success (empty when data absent or empty collection)
    - _Requirements: 9.6, 9.7, 25.1, 25.2, 25.3, 25.4_
    - _Design: Standardized Async States_

  - [ ]* 3.8 Write property test for `selectScreenState`
    - **Property 11: Async screen-state selector totality and precedence**
    - **Validates: Requirements 9.6, 9.7, 25.1, 25.2, 25.3, 25.4**
    - Tag with property number; min 100 iterations

  - [ ] 3.9 Implement `orderStatusLabel`
    - In `src/utils/orderStatus.ts`, map every `OrderStatusEnum` value (PENDING, ACCEPTED, DELIVERING, COMPLETED, CANCELLED, REJECTED) to a defined, non-empty label/badge descriptor (total over the enum)
    - _Requirements: 17.4_
    - _Design: Order Status Model_

  - [ ]* 3.10 Write property test for `orderStatusLabel`
    - **Property 9: Order status mapping totality**
    - **Validates: Requirements 17.4**
    - Tag with property number; min 100 iterations

  - [ ] 3.11 Implement `canAccessSellerRoutes`
    - In `src/utils/sellerAccess.ts`, return a `SellerAccessDecision` granting access iff authenticated and an active store exists; authenticated-without-active-store routes to onboarding regardless of pending/approved application; active store takes precedence over a separate pending application
    - _Requirements: 6.3, 6.4, 20.4, 20.5, 20.6, 20.8_
    - _Design: Seller Onboarding Flow; Route Guards_

  - [ ]* 3.12 Write property test for `canAccessSellerRoutes`
    - **Property 5: Seller-access decision**
    - **Validates: Requirements 6.3, 6.4, 20.4, 20.5, 20.6, 20.8**
    - Tag with property number; min 100 iterations

  - [ ] 3.13 Implement `encodeSearchTerm` and matching decoder
    - In `src/utils/search.ts`, encode a search term into the `q` URL query parameter and decode it back to the original term for any input (including terms that yield zero results)
    - _Requirements: 12.4_
    - _Design: Search (q param round-trip)_

  - [ ]* 3.14 Write property test for search term URL round-trip
    - **Property 12: Search term URL round-trip**
    - **Validates: Requirements 12.4**
    - Tag with property number; min 100 iterations

- [ ] 4. Checkpoint - pure-logic layer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement the API client and service layer
  - [ ] 5.1 Create the Axios instance and interceptors
    - In `src/services/api.ts`, create a single Axios instance with `baseURL` from `import.meta.env.VITE_API_URL`; add a request interceptor that attaches `Authorization: Bearer <token>` from `authStore` when a token exists and adds no header otherwise; add a response interceptor that on 401 clears the session and attempts redirect to `/login` (retaining cleared state if redirect throws) and routes all errors through `normalizeError`
    - _Requirements: 1.1, 1.3, 2.2, 2.4, 2.5, 24.1_
    - _Design: Axios Instance (src/services/api.ts)_

  - [ ]* 5.2 Write property test for the request interceptor's Authorization header
    - **Property 1: Authorization header attachment**
    - **Validates: Requirements 2.2**
    - Tag with property number; min 100 iterations

  - [ ] 5.3 Implement auth, profile, and village services
    - Create `src/services/auth.service.ts` (`login`, `register`, `me`), `src/services/profile.service.ts` (`me`), `src/services/village.service.ts` (`GET /villages`)
    - _Requirements: 1.4, 3.2, 3.3, 4.2, 18.2, 19.5_
    - _Design: Service Modules_

  - [ ] 5.4 Implement product, store, and delivery-zone services
    - Create `src/services/product.service.ts` (list/detail/my/create/update/delete + image endpoints), `src/services/store.service.ts` (list/detail/delivery-zones/my get+patch), `src/services/deliveryZone.service.ts` (create/patch/delete)
    - _Requirements: 1.4, 9.1, 10.1, 11.1, 11.3, 11.4, 20.8, 21.1, 21.4, 21.5, 22.1, 22.2, 22.3, 22.4, 22.5_
    - _Design: Service Modules_

  - [ ] 5.5 Implement cart, order, address, banner, and seller services
    - Create `src/services/cart.service.ts` (get/addItem/updateItem/removeItem/clear), `src/services/order.service.ts` (create/get/myOrders/storeOrders/cancel/accept/reject/delivering/complete), `src/services/address.service.ts` (list/create/get/patch/delete), `src/services/banner.service.ts` (list), `src/services/seller.service.ts` (`POST /store-applications`, `GET /stores/my`)
    - _Requirements: 1.4, 8.1, 14.1, 15.1, 15.2, 15.3, 15.4, 16.2, 17.1, 17.3, 17.5, 19.1, 19.2, 19.3, 19.4, 20.1, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_
    - _Design: Service Modules_

- [ ] 6. Implement Zustand client-state stores and Telegram bootstrap
  - [ ] 6.1 Implement `authStore` with persistence
    - Create `src/stores/authStore.ts` holding `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isLoading` with actions `login`, `logout`, `setUser`, `clearUser`; persist `accessToken`, `refreshToken`, `user` to localStorage via `persist` middleware (the only sensitive values stored)
    - _Requirements: 2.1, 2.3, 2.6, 2.7, 2.8_
    - _Design: authStore_

  - [ ]* 6.2 Write property test for session persistence round-trip
    - **Property 2: Session persistence round-trip**
    - **Validates: Requirements 2.3, 2.8**
    - Tag with property number; min 100 iterations

  - [ ]* 6.3 Write property test for session clearing on 401 or logout
    - **Property 3: Session clearing on 401 or logout**
    - **Validates: Requirements 2.4, 2.5, 2.6, 2.7**
    - Tag with property number; min 100 iterations

  - [ ] 6.4 Implement `uiStore`, `appStore`, and `telegramStore`
    - Create `src/stores/uiStore.ts` (auth modal, search, selectedVillage/location, mobile menu), `src/stores/appStore.ts` (`telegramMode`, `networkStatus`, `appVersion` with setters), `src/stores/telegramStore.ts` (`isTelegram`, `telegramUser`, `themeParams`, `initData` with initialize/set actions)
    - _Requirements: 5.1, 5.4, 24.4, 26.3_
    - _Design: uiStore; appStore; telegramStore_

  - [ ] 6.5 Implement the Telegram bootstrap module
    - Create `src/telegram/bootstrap.ts` that detects `window.Telegram?.WebApp`, calls `ready()`/`expand()`, populates `telegramStore`, sets `appStore.telegramMode = true` (continuing uninterrupted if recording fails while detection succeeded), and applies theme params to CSS variables; performs no init-data-to-JWT exchange
    - _Requirements: 5.1, 5.2, 5.4, 5.5_
    - _Design: Bootstrap Module_

  - [ ] 6.6 Implement the AuthStrategy abstraction and PasswordAuthStrategy
    - Create `src/features/auth/strategy/` with the `AuthStrategy` interface and a registered `PasswordAuthStrategy` that authenticates via the auth service and returns `{ tokens, user? }`; isolate auth logic so a future `TelegramAuthStrategy` is purely additive (no Query Layer or other store changes)
    - _Requirements: 5.3, 2.1_
    - _Design: Auth Strategy Abstraction_

- [ ] 7. Checkpoint - client state and API layer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement reusable UI primitives and standardized state components
  - [ ] 8.1 Implement core UI primitives
    - Create `src/components/ui/{Button,Input,Modal,Badge,Card,Skeleton}.tsx` as functional components using design tokens, with ≥44x44 touch targets and keyboard operability
    - _Requirements: 28.1, 28.2, 28.3, 28.4_
    - _Design: Reusable UI primitives_

  - [ ] 8.2 Implement standardized async-state components
    - Create `src/components/ui/{LoadingState,EmptyState,ErrorState}.tsx` and domain skeletons (`ProductGridSkeleton`, `CartSkeleton`); `ErrorState` includes a retry action; wire them to `selectScreenState` via a small screen-level helper hook/component
    - _Requirements: 24.3, 25.1, 25.2, 25.3, 25.4, 27.4_
    - _Design: Standardized Async States_

  - [ ]* 8.3 Write component tests for state components
    - Test loading/empty/error/success rendering and retry callback invocation
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 24.3_

  - [ ] 8.4 Implement the top-level ErrorBoundary
    - Create `src/app/ErrorBoundary.tsx` catching render-time exceptions and showing a friendly fallback with no raw error exposure
    - _Requirements: 24.2_
    - _Design: Error Boundary_

- [ ] 9. Implement the Query Layer provider, layouts, routing, and guards
  - [ ] 9.1 Create the QueryClient and app providers
    - Create `src/app/queryClient.ts` with the design's default options (staleTime 5m, gcTime 10m, refetchOnWindowFocus false, retry 1) and `src/app/App.tsx` mounting `QueryClientProvider`, `RouterProvider`, and `ErrorBoundary`; run Telegram bootstrap before render in `src/main.tsx`; wire browser online/offline events into `appStore.networkStatus`
    - _Requirements: 24.4, 26.1, 27.3_
    - _Design: Runtime Composition; Default Query Client Configuration_

  - [ ] 9.2 Implement MainLayout and BareLayout with bottom navigation
    - Create `src/layouts/MainLayout.tsx` (fixed bottom nav: Home, Search, Cart, Stores, Profile + `Outlet`) and `src/layouts/BareLayout.tsx` (no nav); keep nav visible on primary screens, hidden on bare-layout screens
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
    - _Design: Layouts and Bottom Navigation_

  - [ ] 9.3 Implement route guards
    - Create `src/routes/ProtectedRoute.tsx` (reads `isAuthenticated`, redirects to `/login`) and `src/routes/SellerRoute.tsx` (requires auth then resolves active store via `useMyStore`, using `canAccessSellerRoutes`; shows loading while resolving, redirects to onboarding when no active store, withholds access on error)
    - _Requirements: 6.2, 6.3, 6.4, 21.2_
    - _Design: Route Guards_

  - [ ]* 9.4 Write route-guard tests for ProtectedRoute and SellerRoute
    - Test redirect/grant/withhold across auth and active-store combinations (complements Property 5/6)
    - _Requirements: 6.2, 6.3, 6.4_

  - [ ] 9.5 Assemble the central route tree with lazy-loaded pages
    - Create `src/routes/routes.tsx` wiring public/authenticated/seller/system route groups to lazy-loaded page placeholders under the correct layouts and guards, including the `/404` Not Found page; reference `paths.ts` constants only
    - _Requirements: 6.1, 6.5, 6.6, 27.2_
    - _Design: Route Groups; Deep Linking and 404_

- [ ] 10. Checkpoint - app shell, routing, and guards
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement the authentication feature
  - [ ] 11.1 Implement login form, validation, and flow
    - Create `src/features/auth/components/LoginForm.tsx` and `src/pages/LoginPage.tsx` using React Hook Form + Zod (phone/password non-empty, phone pattern); on submit call the PasswordAuthStrategy, write the `TokenPair` to `authStore`, then fetch `GET /auth/me` (treat session as authenticated and proceed with limited functionality if me fails); map 401 to a friendly auth error and 403 to a Telegram-verification message
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
    - _Design: Auth Strategy Abstraction; Error Handling_

  - [ ]* 11.2 Write property test for login form validation
    - **Property 4: Login form validation**
    - **Validates: Requirements 3.7**
    - Tag with property number; min 100 iterations

  - [ ] 11.3 Implement registration with Telegram deep link
    - Create `src/features/auth/components/RegisterForm.tsx` and `src/pages/RegisterPage.tsx`; on success display the returned Telegram deep link (still display the link if instructions fail to render) and communicate that verification happens in Telegram; map 400 to field-level/general validation messages
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
    - _Design: Service Modules (auth); Error Handling (400)_

  - [ ] 11.4 Implement the Auth Modal and guest add-to-cart gating
    - Create `src/features/auth/components/AuthModal.tsx` driven by `uiStore`; implement a guest-gating helper used by add-to-cart actions that opens the Auth Modal for guests (blocking the mutation and showing an error if the modal fails to open) and keeps the user on the current screen when closed
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
    - _Design: Guest Add-to-Cart Gating_

  - [ ]* 11.5 Write component/example tests for guest gating
    - **Property 6: Guest authenticated-route and add-to-cart gating** (decision-level)
    - **Validates: Requirements 6.2, 13.1, 13.3**
    - Tag with property number; min 100 iterations

- [ ] 12. Implement shared Query Layer hooks for catalog data
  - [ ] 12.1 Implement product and category query hooks
    - Create `src/features/product/hooks/{useProducts,useProduct,useMyProducts}.ts` (infinite query advancing `?page=N` via `getNextPageParam` from `next`; filters for category/store/search) and `src/features/catalog/hooks/useCategories.ts`
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 10.1, 22.1, 26.5_
    - _Design: Infinite Queries; Query Layer Hook Interfaces_

  - [ ] 12.2 Implement store and delivery-zone query hooks
    - Create `src/features/store/hooks/{useStores,useStore,useMyStore,useStoreDeliveryZones}.ts` (stores infinite query with search filter)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 20.8, 21.1, 26.5_
    - _Design: Query Layer Hook Interfaces_

  - [ ] 12.3 Implement banner, village, and profile query hooks
    - Create `src/features/home/hooks/useBanners.ts`, `src/hooks/useVillages.ts`, `src/features/profile/hooks/useProfile.ts`
    - _Requirements: 8.1, 18.2, 19.5_
    - _Design: Query Layer Hook Interfaces_

- [ ] 13. Implement buyer discovery and browsing features
  - [ ] 13.1 Implement the Home page
    - Create `src/pages/HomePage.tsx` and `src/features/home/components/*` rendering banners, categories, products, and stores with per-section skeletons; tapping the search bar navigates to `/search`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
    - _Design: Standardized Async States_

  - [ ] 13.2 Implement the product catalog/category listing
    - Create `src/pages/CategoryPage.tsx` and `src/features/product/components/{ProductCard,ProductGrid}.tsx` with a two-column mobile grid, category/store/search filters, infinite scroll, and immediate empty state on zero results
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
    - _Design: Catalog & filtering_

  - [ ] 13.3 Implement the product detail page
    - Create `src/pages/ProductDetailPage.tsx` and `src/features/product/components/*` showing gallery, name, price, owning store, and store-specific delivery info, with a persistent add-to-cart action; render Not Found on 404 or missing/invalid data and error/loading otherwise
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
    - _Design: Product detail; Error Handling (404)_

  - [ ] 13.4 Implement stores list and store detail pages
    - Create `src/pages/StoresPage.tsx` (infinite query + search) and `src/pages/StoreDetailPage.tsx` and `src/features/store/components/{StoreCard,*}.tsx` showing the store, its products (filtered by store id), and delivery zones; render Not Found on store 404
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
    - _Design: Stores browsing_

  - [ ] 13.5 Implement the search page
    - Create `src/pages/SearchPage.tsx` and `src/features/search/components/*` with a sticky input and Products/Stores tabs; query both endpoints with the `search` param (allowing no-term queries), reflect the term in the `q` URL param via `encodeSearchTerm` (retained on zero results), and show per-tab empty states
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
    - _Design: Search_

- [ ] 14. Checkpoint - buyer discovery features
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Implement the cart feature (server-side state)
  - [ ] 15.1 Implement cart query and mutation hooks
    - Create `src/features/cart/hooks/{useCart,useAddCartItem,useUpdateCartItem,useRemoveCartItem,useClearCart}.ts`; `useCart` uses query key `["cart"]`; all mutations invalidate `["cart"]` on success and surface friendly errors on 400/403/404; never store cart in Zustand/localStorage
    - _Requirements: 14.1, 14.3, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_
    - _Design: Cart Is Server-Side State_

  - [ ]* 15.2 Write hook tests for cart mutation invalidation
    - Assert each cart mutation invalidates `["cart"]` on success (example/hook level)
    - _Requirements: 15.5_
    - _Design: Testing Strategy (Hook tests)_

  - [ ] 15.3 Implement the cart page and store-grouped UI
    - Create `src/pages/CartPage.tsx` and `src/features/cart/components/{CartStoreGroup,CartItemRow,CartSummary}.tsx` rendering items grouped by store (via `groupCartByStore`), with cart skeleton, empty state, and quantity/remove/clear controls
    - _Requirements: 14.2, 14.4, 14.5_
    - _Design: Feature-Module Pattern (cart)_

- [ ] 16. Implement per-store checkout and buyer orders
  - [ ] 16.1 Implement the order-creation hook
    - Create `src/features/order/hooks/useCreateOrder.ts` that posts to `/orders` and on success invalidates `["cart"]` (so the checked-out store's items are removed while others remain)
    - _Requirements: 16.2, 16.3_
    - _Design: Per-Store Checkout and Cart Invalidation Flow_

  - [ ] 16.2 Implement the multi-step checkout flow
    - Create `src/pages/CheckoutPage.tsx` and `src/features/order/components/CheckoutStepper.tsx` scoped to `:storeId`, covering delivery method, contact info, and order review; require a selected/provided delivery address before creation; on success navigate to `/order-success/:orderId`; map 400/403/404 to friendly errors
    - _Requirements: 16.1, 16.4, 16.5, 16.6, 16.7_
    - _Design: Per-Store Checkout; Error Handling_

  - [ ] 16.3 Implement order list and order detail hooks and pages
    - Create `src/features/order/hooks/{useMyOrders,useOrder,useCancelOrder}.ts` and `src/pages/{OrdersPage,OrderDetailPage,OrderSuccessPage}.tsx`; orders use an infinite query; render status via `orderStatusLabel`; cancel maps 409 to a "cannot cancel in current status" message; show error-with-retry and empty states
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_
    - _Design: Buyer orders; Order Status Model_

- [ ] 17. Implement profile and address management
  - [ ] 17.1 Implement the profile page
    - Create `src/pages/ProfilePage.tsx` showing guest entry points (login/register) for guests; for authenticated users show account info, orders, and addresses entry points; show "Become a Seller" when no active store and "Seller Dashboard" when an active store exists; logout clears the session and returns to guest state
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
    - _Design: Profile_

  - [ ] 17.2 Implement address management hooks and page
    - Create `src/features/address/hooks/{useAddresses,useCreateAddress,useUpdateAddress,useDeleteAddress}.ts` and `src/pages/AddressesPage.tsx` with village selection (from `useVillages`); map any address error to a friendly message
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_
    - _Design: Address management_

- [ ] 18. Checkpoint - buyer shopping flows
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Implement seller onboarding and dashboard
  - [ ] 19.1 Implement seller application onboarding
    - Create `src/features/seller/hooks/useSellerApplication.ts` and `src/pages/seller/SellerOnboardingPage.tsx` submitting store name + phone to `/store-applications`; represent status as Pending/Approved/Rejected; show pending state (no seller access), grant access when approved with active store, withhold when approved without active store, and allow re-application when rejected
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.6, 20.7_
    - _Design: Seller Onboarding Flow_

  - [ ] 19.2 Implement the seller dashboard and store settings
    - Create `src/pages/seller/SellerDashboardPage.tsx` and `src/pages/seller/SellerSettingsPage.tsx`; load store via `useMyStore` (show error and withhold access on failure); show products/orders/statistics/settings sections; update settings via `PATCH /stores/my` mapping 403 to a not-permitted message
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.6_
    - _Design: Seller dashboard & settings_

  - [ ] 19.3 Implement delivery-zone management
    - Create `src/features/seller/hooks/{useCreateDeliveryZone,useUpdateDeliveryZone,useDeleteDeliveryZone}.ts` and delivery-zone management UI in seller settings
    - _Requirements: 21.5_
    - _Design: Service Modules (deliveryZone)_

- [ ] 20. Implement seller product and order management
  - [ ] 20.1 Implement seller product management hooks and pages
    - Create `src/features/seller/hooks/{useCreateProduct,useUpdateProduct,useDeleteProduct}.ts` and `src/pages/seller/{SellerProductsPage,SellerProductFormPage}.tsx` listing `/products/my`, with create/edit/delete; validate forms with Zod; on 403 show not-permitted and do not display the unauthorized resource data
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.6, 22.7_
    - _Design: Seller product management_

  - [ ] 20.2 Implement product image management
    - Create `src/features/seller/hooks/{useProductImages,useReorderProductImages,useDeleteProductImage}.ts` and image management UI using the image list, reorder (`/products/{id}/images/reorder`), and delete (`/product-images/{image_id}`) endpoints
    - _Requirements: 22.5_
    - _Design: Service Modules (product images)_

  - [ ] 20.3 Implement seller order management hooks and pages
    - Create `src/features/seller/hooks/{useStoreOrders,useAcceptOrder,useRejectOrder,useDeliveringOrder,useCompleteOrder}.ts` and `src/pages/seller/{SellerOrdersPage,SellerOrderDetailPage}.tsx`; store orders use an infinite query; transition actions map 409 to a not-allowed-in-current-status message and refresh the affected order and list on success
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 23.7, 23.8_
    - _Design: Seller order management; Order Status Model_

  - [ ]* 20.4 Write hook tests for seller order transitions
    - Assert each transition refreshes the affected order and list on success and surfaces 409 messages
    - _Requirements: 23.7, 23.8_
    - _Design: Testing Strategy (Hook tests)_

- [ ] 21. Checkpoint - seller flows
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Cross-cutting polish and final wiring
  - [ ] 22.1 Wire all pages into the route tree and verify lazy loading
    - Replace lazy page placeholders in `src/routes/routes.tsx` with the real page modules under correct layouts/guards; confirm every page-level route is `React.lazy`-loaded with `Suspense` fallbacks and no orphaned modules remain
    - _Requirements: 6.1, 6.5, 6.6, 7.3, 27.2_
    - _Design: Runtime Composition; Route Groups_

  - [ ] 22.2 Accessibility pass
    - Audit interactive elements for ≥44x44 touch targets, keyboard operability, semantic HTML, and token-based color contrast across primitives and pages; fix violations
    - _Requirements: 28.1, 28.2, 28.3, 28.4_
    - _Design: Accessibility_

  - [ ]* 22.3 Write responsive layout tests/checks
    - Add tests/checks verifying key pages render correctly at 320/375/768/1280px and skeletons prevent blank screens
    - _Requirements: 27.1, 27.4_
    - _Design: Performance; Responsive breakpoints_

  - [ ] 22.4 Remove debug statements and finalize build
    - Remove `console.*` statements, ensure strict-mode/no-`any` clean build, run lint and the full test suite
    - _Requirements: 1.6_
    - _Design: General Principles; Logging Rules_

- [ ] 23. Final checkpoint - full suite
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP, though the 12 property-based tests are the primary correctness guarantees for the pure-logic layer.
- Each correctness property (1–12) is implemented by a single fast-check property test running a minimum of 100 iterations and tagged `// Feature: suxonashop-frontend, Property {n}: {text}`.
- Property tests are colocated with the utilities/modules they validate so errors are caught early (Properties 1–3 with the API client/authStore, 4–12 with their respective utilities/forms).
- Each task references specific requirement clauses and design sections for traceability.
- `backend/schema.yml` is the single source of truth; regenerate `src/types/schema.d.ts` whenever it changes.
- Checkpoints provide incremental validation; the workflow stops after artifact creation and does not implement the feature.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["1.5", "1.6"] },
    { "id": 3, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 4, "tasks": ["3.1", "3.3", "3.5", "3.7", "3.9", "3.11", "3.13"] },
    { "id": 5, "tasks": ["3.2", "3.4", "3.6", "3.8", "3.10", "3.12", "3.14"] },
    { "id": 6, "tasks": ["6.1", "6.4"] },
    { "id": 7, "tasks": ["5.1", "6.2", "6.3", "6.5", "6.6"] },
    { "id": 8, "tasks": ["5.2", "5.3", "5.4", "5.5"] },
    { "id": 9, "tasks": ["8.1", "8.4"] },
    { "id": 10, "tasks": ["8.2"] },
    { "id": 11, "tasks": ["8.3", "9.1", "9.2", "9.3"] },
    { "id": 12, "tasks": ["9.4", "9.5"] },
    { "id": 13, "tasks": ["11.1", "11.3", "11.4", "12.1", "12.2", "12.3"] },
    { "id": 14, "tasks": ["11.2", "11.5", "15.1", "16.1"] },
    { "id": 15, "tasks": ["13.1", "13.2", "13.3", "13.4", "13.5", "15.3"] },
    { "id": 16, "tasks": ["15.2", "16.2", "16.3", "17.1", "17.2"] },
    { "id": 17, "tasks": ["19.1", "19.2", "19.3", "20.1", "20.3"] },
    { "id": 18, "tasks": ["20.2", "20.4"] },
    { "id": 19, "tasks": ["22.1", "22.2"] },
    { "id": 20, "tasks": ["22.3", "22.4"] }
  ]
}
```
