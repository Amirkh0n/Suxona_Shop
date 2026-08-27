# Requirements Document

## Introduction

SuxonaShop Frontend is a production-oriented, mobile-first, multi-vendor marketplace web application built with React, TypeScript, and Vite. It is optimized primarily for use inside Telegram Mini Apps while providing full browser support. The application connects local sellers with nearby buyers, allowing buyers to browse stores and products, manage a server-side shopping cart, and place per-store orders. Sellers manage their own stores, products, and incoming orders from within the same application.

This document specifies the functional and non-functional requirements for the frontend only. No backend behavior is defined here; the backend OpenAPI schema at `backend/schema.yml` is the single source of truth for all backend integration. Where any reference document conflicts with the schema, the schema prevails.

Key architectural decisions reflected throughout:
- The shopping cart is server-side state managed through TanStack Query. The cart is never stored in Zustand or localStorage.
- Zustand manages only client-side state (authentication session/tokens, UI state, application state, Telegram state). All server state belongs to TanStack Query.
- Seller onboarding uses store applications with admin approval (Pending -> Approved/Rejected).
- Telegram Mini App auto-login is future functionality. The MVP authenticates via phone + password JWT. The architecture must be prepared for Telegram auto-login without implementing it.
- Favorites are out of MVP scope; the architecture must not block their future addition.

## Glossary

- **Frontend**: The SuxonaShop client web application described by this document (React + TypeScript + Vite).
- **API_Client**: The centralized Axios-based HTTP layer (`src/services/api.ts`) through which all backend requests pass.
- **Service_Layer**: The set of typed service modules (`src/services/*`) that wrap API_Client calls; the only layer permitted to call API_Client directly.
- **Query_Layer**: The TanStack Query hooks and configuration that own all server state.
- **Auth_Store**: The Zustand store that holds the authenticated session (user, access token, refresh token, authentication status).
- **UI_Store**: The Zustand store that holds global UI state (auth modal visibility, selected village/location, menu state).
- **App_Store**: The Zustand store that holds global application state (Telegram mode, network status, app version).
- **Telegram_Store**: The Zustand store that holds Telegram Mini App integration state (Telegram detection, Telegram user, theme params, init data).
- **Guest**: An unauthenticated visitor.
- **Buyer**: An authenticated user who can shop, order, and manage profile data.
- **Seller**: An authenticated user who owns an active (approved) store. Buyer and Seller share one account.
- **Cart**: The server-side shopping cart, retrieved grouped by store from the backend.
- **Store_Group**: A set of cart items belonging to a single store within the Cart response.
- **Store_Application**: A user's request to open a store, subject to admin approval, with status Pending, Approved, or Rejected.
- **Order_Status**: One of PENDING, ACCEPTED, DELIVERING, COMPLETED, CANCELLED, REJECTED, as defined by the schema `OrderStatusEnum`.
- **Auth_Modal**: A modal prompting authentication, shown when a Guest attempts a Buyer-only action.
- **Route_Guard**: A frontend mechanism that restricts route access based on authentication and store ownership.
- **Schema**: The backend OpenAPI document at `backend/schema.yml`, the single source of truth for backend integration.
- **Page_Cursor**: The page-number pagination parameter (`?page=N`) used by paginated backend list endpoints.

## Requirements

### Requirement 1: API Client and Type Generation

**User Story:** As a developer, I want all backend communication to flow through a single typed client derived from the schema, so that integration stays consistent, type-safe, and aligned with the source of truth.

#### Acceptance Criteria

1. THE Frontend SHALL route all backend HTTP requests through the API_Client module.
2. THE Frontend SHALL use Schema-generated TypeScript types for request and response payloads.
3. THE Frontend SHALL read the backend base URL from an environment variable rather than a hardcoded value.
4. THE Service_Layer SHALL be the only layer that invokes the API_Client directly.
5. WHERE a component requires server data, THE component SHALL consume Query_Layer hooks rather than calling the Service_Layer or API_Client directly.
6. THE Frontend SHALL operate under TypeScript strict mode without using the `any` type.

### Requirement 2: Authentication Token Handling

**User Story:** As a Buyer, I want my session to be securely maintained, so that I stay logged in and my authenticated requests succeed without manual token handling.

#### Acceptance Criteria

1. WHEN a login succeeds, THE Auth_Store SHALL store the access token and refresh token returned in the `TokenPair`.
2. WHEN an authenticated request is sent, THE API_Client SHALL attach the access token as an `Authorization` header.
3. THE Auth_Store SHALL persist the access token, refresh token, and user to localStorage.
4. IF a backend response indicates an unauthorized (HTTP 401) condition, THEN THE Frontend SHALL clear the stored session and route the user to the login screen.
5. IF session clearing succeeds but routing to the login screen fails, THEN THE Frontend SHALL retain the cleared session state and allow the user to navigate manually.
6. WHERE a non-401 condition requires ending the session (for example a user-triggered logout), THE Frontend SHALL clear the stored session.
7. WHEN a user logs out, THE Auth_Store SHALL clear the stored user and tokens.
8. THE Frontend SHALL store authentication tokens as the only sensitive values placed in localStorage.

### Requirement 3: Login

**User Story:** As a registered user, I want to log in with my phone number and password, so that I can access Buyer and Seller features.

#### Acceptance Criteria

1. THE Frontend SHALL provide a login screen at route `/login` with phone and password fields.
2. WHEN a user submits the login form, THE Frontend SHALL send the credentials to the login endpoint (`POST /api/v1/auth/login`).
3. WHEN login succeeds, THE Frontend SHALL retrieve the current user from `GET /api/v1/auth/me` and establish an authenticated session.
4. IF login succeeds but the current-user retrieval fails, THEN THE Frontend SHALL treat the session as authenticated and allow the user to proceed with limited functionality.
5. IF login returns an invalid-credentials response (HTTP 401), THEN THE Frontend SHALL display a user-friendly authentication error message without exposing the raw server response.
6. IF login returns an account-not-verified response (HTTP 403), THEN THE Frontend SHALL display a message instructing the user to complete Telegram verification.
7. THE Frontend SHALL validate that phone and password fields are non-empty before submission using Zod-based form validation.

### Requirement 4: Registration

**User Story:** As a new user, I want to register and be guided to verify my account through Telegram, so that I can activate my account.

#### Acceptance Criteria

1. THE Frontend SHALL provide a registration screen at route `/register`.
2. WHEN a user submits the registration form, THE Frontend SHALL send the data to the registration endpoint (`POST /api/v1/auth/register`).
3. WHEN registration succeeds, THE Frontend SHALL display the returned Telegram deep link and instruct the user to open Telegram to verify the account.
4. IF the verification instructions fail to render, THEN THE Frontend SHALL still display the returned Telegram deep link.
5. THE Frontend SHALL communicate that account verification is completed in Telegram and not within the browser.
6. IF registration returns a validation error (HTTP 400), THEN THE Frontend SHALL display field-level or general validation messages derived from a standardized error format.

### Requirement 5: Telegram Auto-Login Readiness

**User Story:** As a product owner, I want the architecture prepared for future Telegram Mini App auto-login, so that it can be added later without restructuring.

#### Acceptance Criteria

1. THE Telegram_Store SHALL capture Telegram environment detection, Telegram user, theme parameters, and init data when the Frontend runs inside a Telegram Mini App.
2. THE Frontend SHALL NOT implement Telegram init-data-to-JWT exchange in the MVP.
3. THE Frontend SHALL isolate authentication logic so that an additional Telegram login method can be added without changing the Query_Layer or other Zustand stores.
4. WHILE running inside a Telegram Mini App, THE App_Store SHALL record that Telegram mode is active.
5. IF recording Telegram mode fails while Telegram detection succeeds, THEN THE Frontend SHALL continue running without interruption.

### Requirement 6: Role-Based Access and Route Guards

**User Story:** As a user, I want pages to be accessible according to my role, so that I am directed to authentication or onboarding when required.

#### Acceptance Criteria

1. THE Frontend SHALL allow Guests to access the home, search, stores list, store detail, product detail, login, and registration routes.
2. IF a Guest navigates to an authenticated route (`/cart`, `/checkout/:storeId`, `/orders`, `/orders/:id`, `/profile`, `/addresses`), THEN THE Route_Guard SHALL redirect the user to the login screen.
3. WHERE a route is a seller route (`/seller` and its subroutes), THE Route_Guard SHALL require an authenticated user who owns an active store.
4. IF an authenticated user without an active store navigates to a seller route, THEN THE Route_Guard SHALL redirect the user to the seller onboarding (store application) flow in all cases.
5. THE Frontend SHALL define all routes centrally in the routing module rather than hardcoding route paths across components.
6. WHEN an unknown route is requested, THE Frontend SHALL display a Not Found page.

### Requirement 7: Global Navigation and Layout

**User Story:** As a user, I want consistent bottom navigation and layout, so that I can reach primary features within one or two interactions.

#### Acceptance Criteria

1. THE Frontend SHALL display a bottom navigation bar with Home, Search, Cart, Stores, and Profile tabs.
2. WHILE the user is on a primary screen, THE Frontend SHALL keep the bottom navigation bar visible.
3. WHILE the user is on the login, registration, checkout, or seller onboarding screens, THE Frontend SHALL hide the bottom navigation bar.
4. WHEN a user selects a navigation tab, THE Frontend SHALL navigate to that tab's route.

### Requirement 8: Home Page Discovery

**User Story:** As a user, I want a home page that surfaces banners, categories, stores, and products, so that I can discover items quickly.

#### Acceptance Criteria

1. WHEN the home page loads, THE Frontend SHALL retrieve and display active banners from `GET /api/v1/banners/`.
2. WHEN the home page loads, THE Frontend SHALL retrieve and display active categories from `GET /api/v1/categories`.
3. WHEN the home page loads, THE Frontend SHALL retrieve and display products from `GET /api/v1/products`.
4. WHEN the home page loads, THE Frontend SHALL retrieve and display stores from `GET /api/v1/stores`.
5. WHEN a user taps the search bar on the home page, THE Frontend SHALL navigate to the search route, optionally after completing in-progress validation or pending requests.
6. WHILE banner, category, store, or product data is loading, THE Frontend SHALL display skeleton loaders in place of the corresponding sections.

### Requirement 9: Product Catalog and Filtering

**User Story:** As a user, I want to browse and filter products by category, store, and search term with pagination, so that I can find products efficiently.

#### Acceptance Criteria

1. THE Frontend SHALL provide a product listing route (`/category/:slug`) that displays products in a two-column mobile grid.
2. WHERE a category filter is selected, THE Frontend SHALL request products with the `category` query parameter on `GET /api/v1/products`.
3. WHERE a store filter is selected, THE Frontend SHALL request products with the `store` query parameter on `GET /api/v1/products`.
4. WHERE a search term is provided, THE Frontend SHALL request products with the `search` query parameter on `GET /api/v1/products`.
5. THE Frontend SHALL load paginated product lists using an infinite query that advances the Page_Cursor.
6. WHEN a product list request returns zero results, THE Frontend SHALL display an empty state immediately.
7. WHILE a product list contains one or more results, THE Frontend SHALL display the products and SHALL NOT display the empty state.

### Requirement 10: Product Detail

**User Story:** As a user, I want to view full product details with images and store-specific delivery information, so that I can decide whether to purchase.

#### Acceptance Criteria

1. WHEN the product detail route (`/product/:id`) loads, THE Frontend SHALL retrieve the product from `GET /api/v1/products/{product_id}`.
2. THE Frontend SHALL display the product gallery, name, price, and owning store on the product detail screen.
3. IF the product information cannot be retrieved or displayed, THEN THE Frontend SHALL display an error state or loading indicator in place of the product information.
4. THE Frontend SHALL display store-specific delivery information for the product's store.
5. IF the requested product is not found (HTTP 404) OR the returned product data is missing or invalid, THEN THE Frontend SHALL display a Not Found state for the product.
6. THE Frontend SHALL display a persistent add-to-cart action on the product detail screen.

### Requirement 11: Stores Browsing

**User Story:** As a user, I want to browse and search stores and view a store's products, so that I can shop by store.

#### Acceptance Criteria

1. WHEN the stores route (`/stores`) loads, THE Frontend SHALL retrieve stores from `GET /api/v1/stores` using an infinite query.
2. WHERE a store search term is provided, THE Frontend SHALL request stores with the `search` query parameter on `GET /api/v1/stores`.
3. WHEN the store detail route (`/store/:slug`) loads, THE Frontend SHALL retrieve the store from `GET /api/v1/stores/{store_id}` and its products via `GET /api/v1/products` filtered by store.
4. THE Frontend SHALL retrieve a store's delivery zones from `GET /api/v1/stores/{store_id}/delivery-zones` for display of delivery information.
5. IF the main store retrieval (`GET /api/v1/stores/{store_id}`) returns Not Found (HTTP 404), THEN THE Frontend SHALL display a Not Found state for the store.

### Requirement 12: Search

**User Story:** As a user, I want to search products and stores from one screen, so that I can find what I need quickly.

#### Acceptance Criteria

1. THE Frontend SHALL provide a search route (`/search`) with a sticky search input and tabs for Products and Stores.
2. WHEN a user enters a search term, THE Frontend SHALL query products via `GET /api/v1/products` with the `search` parameter and stores via `GET /api/v1/stores` with the `search` parameter.
3. WHERE no search term has been entered, THE Frontend SHALL be permitted to query products and stores without the `search` parameter.
4. THE Frontend SHALL reflect the active search term in the URL query parameter `q`, retaining the term even when the search returns zero results.
5. WHEN a search returns zero results for the active tab, THE Frontend SHALL display an empty state for that tab.

### Requirement 13: Guest Add-to-Cart Gating

**User Story:** As a Guest, I want to be prompted to authenticate when I try to add to cart, so that I understand I must log in to shop.

#### Acceptance Criteria

1. IF a Guest activates an add-to-cart action, THEN THE Frontend SHALL open the Auth_Modal instead of adding the item.
2. IF the Auth_Modal fails to open due to a technical issue, THEN THE Frontend SHALL block the add-to-cart action entirely and display an error message.
3. THE Frontend SHALL NOT maintain any guest cart state in the MVP.
4. WHEN a Guest closes the Auth_Modal without authenticating, THE Frontend SHALL keep the user on the current screen.
5. WHILE a user is unauthenticated, THE Frontend SHALL prevent order creation actions.

### Requirement 14: Server-Side Cart Retrieval

**User Story:** As a Buyer, I want to view my cart grouped by store, so that I can review items before checking out per store.

#### Acceptance Criteria

1. WHEN the cart route (`/cart`) loads for an authenticated Buyer, THE Frontend SHALL retrieve the Cart from `GET /api/v1/cart` via the Query_Layer using query key `["cart"]`.
2. WHEN Cart data is available, THE Frontend SHALL display cart items grouped by Store_Group as returned by the backend.
3. THE Frontend SHALL NOT store Cart data in Zustand or localStorage.
4. WHEN the Cart contains no items, THE Frontend SHALL display an empty cart state.
5. WHILE Cart data is loading, THE Frontend SHALL display a cart skeleton loader.

### Requirement 15: Cart Mutations

**User Story:** As a Buyer, I want to add, update, remove, and clear cart items, so that I can manage what I intend to buy.

#### Acceptance Criteria

1. WHEN a Buyer adds a product to the cart, THE Frontend SHALL send the product and quantity to `POST /api/v1/cart/items`.
2. WHEN a Buyer changes a cart item quantity, THE Frontend SHALL send the new quantity to `PATCH /api/v1/cart/items/{item_id}`.
3. WHEN a Buyer removes a cart item, THE Frontend SHALL send a request to `DELETE /api/v1/cart/items/{item_id}`.
4. WHEN a Buyer clears the cart, THE Frontend SHALL send a request to `DELETE /api/v1/cart`.
5. WHEN any cart mutation succeeds, THE Frontend SHALL invalidate the `["cart"]` query to refresh cart state.
6. IF a cart mutation returns an error (HTTP 400, 403, or 404), THEN THE Frontend SHALL display a user-friendly error message without exposing the raw server response.

### Requirement 16: Per-Store Checkout

**User Story:** As a Buyer, I want to check out one store at a time, so that each order belongs to exactly one store.

#### Acceptance Criteria

1. THE Frontend SHALL provide a checkout route (`/checkout/:storeId`) scoped to a single store's cart items.
2. WHEN a Buyer confirms checkout for a store, THE Frontend SHALL create an order via `POST /api/v1/orders` with the selected store and delivery address.
3. WHEN order creation succeeds, THE Frontend SHALL invalidate the `["cart"]` query so that the checked-out store's items are removed and other stores' items remain in the displayed cart.
4. WHEN order creation succeeds, THE Frontend SHALL navigate to an order success screen (`/order-success/:orderId`).
5. THE Frontend SHALL require the Buyer to select or provide a delivery address before order creation.
6. IF order creation returns an error (HTTP 400, 403, or 404), THEN THE Frontend SHALL display a user-friendly error message without exposing the raw server response.
7. THE Frontend SHALL collect checkout input through a multi-step flow covering delivery method, contact information, and order review.

### Requirement 17: Buyer Orders

**User Story:** As a Buyer, I want to view my order history and order details with current status, so that I can track my purchases.

#### Acceptance Criteria

1. WHEN the orders route (`/orders`) loads, THE Frontend SHALL retrieve the Buyer's orders from `GET /api/v1/orders/my` using an infinite query.
2. IF the orders retrieval fails due to a network or server error, THEN THE Frontend SHALL display an error state with a retry action.
3. WHEN the order detail route (`/orders/:id`) loads, THE Frontend SHALL retrieve the order from `GET /api/v1/orders/{order_id}`.
4. WHEN order data has been retrieved, THE Frontend SHALL display each order's Order_Status using the values defined by the Schema `OrderStatusEnum`.
5. WHEN a Buyer cancels an order, THE Frontend SHALL send a request to `POST /api/v1/orders/{order_id}/cancel`.
6. IF an order cancellation returns an invalid-transition response (HTTP 409), THEN THE Frontend SHALL display a message that the order cannot be cancelled in its current status.
7. WHEN the Buyer has no orders, THE Frontend SHALL display an empty orders state.

### Requirement 18: User Profile

**User Story:** As a Buyer, I want to view and manage my profile, so that I can access my account, orders, addresses, and seller options.

#### Acceptance Criteria

1. WHILE a user is a Guest, THE profile screen SHALL present login and registration entry points.
2. WHILE a user is authenticated, THE Frontend SHALL retrieve the current user from `GET /api/v1/auth/me` and display account information, orders, and addresses entry points together for any authenticated user.
3. WHERE the authenticated user does not own an active store, THE profile screen SHALL present a "Become a Seller" entry point to the store application flow.
4. WHERE the authenticated user owns an active store, THE profile screen SHALL present a "Seller Dashboard" entry point.
5. WHEN a user logs out from the profile screen, THE Frontend SHALL clear the session and return the user to the Guest profile state.

### Requirement 19: Address Management

**User Story:** As a Buyer, I want to manage my delivery addresses, so that I can use them during checkout.

#### Acceptance Criteria

1. WHEN the addresses route (`/addresses`) loads, THE Frontend SHALL retrieve the Buyer's addresses from `GET /api/v1/addresses`.
2. WHEN a Buyer creates an address, THE Frontend SHALL send the data to `POST /api/v1/addresses`.
3. WHEN a Buyer updates an address, THE Frontend SHALL send the data to `PATCH /api/v1/addresses/{address_id}`.
4. WHEN a Buyer deletes an address, THE Frontend SHALL send a request to `DELETE /api/v1/addresses/{address_id}`.
5. THE Frontend SHALL retrieve villages from `GET /api/v1/villages` for address selection input.
6. IF an address operation returns an error of any type (including validation errors at HTTP 400, network failures, or server errors), THEN THE Frontend SHALL display a user-friendly error message without exposing the raw server response.

### Requirement 20: Seller Onboarding via Store Application

**User Story:** As an authenticated user, I want to apply to open a store and see my application status, so that I can become a Seller upon admin approval.

#### Acceptance Criteria

1. WHEN an authenticated user submits a store application, THE Frontend SHALL send the store name and phone to `POST /api/v1/store-applications`.
2. THE Frontend SHALL represent store application status as Pending, Approved, or Rejected, matching the Schema `StoreApplicationStatusEnum`.
3. WHILE a user's store application is Pending, THE Frontend SHALL display a pending state and SHALL NOT grant access to seller routes.
4. WHEN a user's store application is Approved and an active store exists, THE Frontend SHALL grant access to seller routes.
5. WHERE a user has both an active store and a separate Pending application, THE Frontend SHALL grant seller route access based on the active store, taking precedence over the Pending application.
6. IF a user's store application is Approved but no active store exists yet, THEN THE Frontend SHALL withhold seller route access until an active store exists.
7. IF a user's store application is Rejected, THEN THE Frontend SHALL display the rejection state and allow the user to submit a new application.
8. THE Frontend SHALL determine active store ownership using `GET /api/v1/stores/my`.

### Requirement 21: Seller Dashboard and Store Settings

**User Story:** As a Seller, I want a dashboard and store settings, so that I can monitor and configure my store.

#### Acceptance Criteria

1. WHEN the seller dashboard route (`/seller`) loads, THE Frontend SHALL retrieve the Seller's store from `GET /api/v1/stores/my`.
2. IF the seller store retrieval fails due to a network or server error, THEN THE Frontend SHALL display an error message and withhold dashboard access until the store data loads.
3. THE Frontend SHALL display seller dashboard sections for products, orders, statistics, and store settings.
4. WHEN a Seller updates store settings, THE Frontend SHALL send the changes to `PATCH /api/v1/stores/my`.
5. WHEN a Seller manages delivery zones, THE Frontend SHALL use the delivery-zone endpoints (`POST /api/v1/delivery-zones`, `PATCH /api/v1/delivery-zones/{zone_id}`, `DELETE /api/v1/delivery-zones/{zone_id}`).
6. IF a store settings update returns an ownership error (HTTP 403), THEN THE Frontend SHALL display a message indicating the action is not permitted.

### Requirement 22: Seller Product Management

**User Story:** As a Seller, I want to create, edit, and delete products and manage product images, so that I can keep my catalog up to date.

#### Acceptance Criteria

1. WHEN the seller products route (`/seller/products`) loads, THE Frontend SHALL retrieve the Seller's products from `GET /api/v1/products/my`.
2. WHEN a Seller creates a product, THE Frontend SHALL send the data to `POST /api/v1/products`.
3. WHEN a Seller updates a product, THE Frontend SHALL send the changes to `PATCH /api/v1/products/{product_id}`.
4. WHEN a Seller deletes a product, THE Frontend SHALL send a request to `DELETE /api/v1/products/{product_id}`.
5. WHEN a Seller manages product images, THE Frontend SHALL use the product image endpoints for listing, reordering (`POST /api/v1/products/{product_id}/images/reorder`), and deletion (`DELETE /api/v1/product-images/{image_id}`).
6. THE Frontend SHALL validate seller product forms using Zod before submission.
7. IF a product operation returns an ownership error (HTTP 403), THEN THE Frontend SHALL display a message indicating the action is not permitted and SHALL NOT display retrieved product data for the unauthorized resource.

### Requirement 23: Seller Order Management

**User Story:** As a Seller, I want to view incoming orders and update their status, so that I can fulfill orders.

#### Acceptance Criteria

1. WHEN the seller orders route (`/seller/orders`) loads, THE Frontend SHALL retrieve the store's orders from `GET /api/v1/orders/store` using an infinite query.
2. WHEN the seller order detail route (`/seller/orders/:id`) loads, THE Frontend SHALL retrieve the order from `GET /api/v1/orders/{order_id}`.
3. WHEN a Seller accepts an order, THE Frontend SHALL send a request to `POST /api/v1/orders/{order_id}/accept`.
4. WHEN a Seller rejects an order, THE Frontend SHALL send a request to `POST /api/v1/orders/{order_id}/reject`.
5. WHEN a Seller marks an order as delivering, THE Frontend SHALL send a request to `POST /api/v1/orders/{order_id}/delivering`.
6. WHEN a Seller completes an order, THE Frontend SHALL send a request to `POST /api/v1/orders/{order_id}/complete`.
7. IF an order state transition returns an invalid-transition response (HTTP 409), THEN THE Frontend SHALL display a message indicating the transition is not allowed in the order's current status.
8. WHEN a seller order action succeeds, THE Frontend SHALL refresh the affected order and order list data.

### Requirement 24: Standardized Error Handling

**User Story:** As a user, I want clear and friendly error messages, so that I never see raw technical errors.

#### Acceptance Criteria

1. WHEN a backend request fails, THE Frontend SHALL present a user-friendly message derived from a standardized error format containing a message and status.
2. THE Frontend SHALL NOT display raw server error responses or stack traces to users.
3. WHERE a failed request is retryable, THE Frontend SHALL provide a retry action.
4. WHEN a network connection is unavailable, THE App_Store SHALL record an offline network status and THE Frontend SHALL inform the user with a user-friendly message in the standardized format.

### Requirement 25: Loading, Empty, and Error States

**User Story:** As a user, I want every asynchronous screen to communicate its state, so that I am never left with a blank screen.

#### Acceptance Criteria

1. WHILE an asynchronous screen is loading data, THE Frontend SHALL display a skeleton loader or loading placeholder.
2. WHEN an asynchronous screen has loaded data successfully, THE Frontend SHALL display the success state.
3. WHEN an asynchronous screen returns no data, THE Frontend SHALL display an empty state.
4. IF an asynchronous screen request fails, THEN THE Frontend SHALL display an error state with a retry action.

### Requirement 26: Server-State and Client-State Separation

**User Story:** As a developer, I want strict separation of server and client state, so that the architecture stays predictable and maintainable.

#### Acceptance Criteria

1. THE Query_Layer SHALL be the exclusive owner of all server state including products, categories, stores, delivery zones, villages, cart, orders, profile, store application, and banners.
2. THE Frontend SHALL NOT duplicate server state inside any Zustand store.
3. THE Frontend SHALL restrict Zustand stores to authentication session, UI state, application state, and Telegram state.
4. THE Query_Layer SHALL define query keys centrally in a query key factory.
5. THE Query_Layer SHALL use infinite queries for products, stores, and orders lists.

### Requirement 27: Mobile-First Responsiveness and Performance

**User Story:** As a mobile user on a low-end device and slow network, I want fast, mobile-optimized screens, so that I can shop comfortably.

#### Acceptance Criteria

1. THE Frontend SHALL render correctly at viewport widths of 320px, 375px, 768px, and 1280px, prioritizing the mobile layout.
2. THE Frontend SHALL lazy-load all page-level routes.
3. THE Frontend SHALL apply the configured Query_Layer caching defaults so that repeated navigation reuses cached server data rather than refetching on every view.
4. WHILE a skeleton loader is displayed during a data fetch, THE Frontend SHALL ensure no blank screen is visible.

### Requirement 28: Accessibility

**User Story:** As a user relying on assistive technology or touch, I want accessible interfaces, so that I can use the application effectively.

#### Acceptance Criteria

1. THE Frontend SHALL provide interactive touch targets whose width is at least 44px and whose height is at least 44px.
2. THE Frontend SHALL make buttons and inputs operable via keyboard.
3. THE Frontend SHALL use semantic HTML elements for structure and controls.
4. THE Frontend SHALL meet color-contrast guidelines defined by the design system for text and interactive elements.

### Requirement 29: Future Feature Extensibility

**User Story:** As a product owner, I want the architecture to accommodate future features, so that adding them does not require major refactoring.

#### Acceptance Criteria

1. THE Frontend SHALL structure code so that favorites can be added later without replacing the Query_Layer or Zustand stores.
2. THE Frontend SHALL NOT implement favorites functionality in the MVP.
3. THE routing architecture SHALL accommodate future routes (for example favorites, reviews, chat, notifications, payment methods) without restructuring primary navigation.
