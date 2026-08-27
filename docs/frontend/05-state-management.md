# SuxonaShop State Management Architecture

## Purpose

This document defines how application state is managed throughout the SuxonaShop frontend.

The architecture must remain:

* Simple
* Scalable
* Predictable
* Easy to maintain
* API-driven

The project uses a hybrid state management approach:

* Zustand for client state
* TanStack Query for server state

The OpenAPI schema (`schema.yml`) is the source of truth for all backend-driven state.

---

# State Management Principles

## Rule 1

Server state must never be duplicated inside Zustand.

Server state belongs exclusively to TanStack Query.

Examples:

* Products
* Categories
* Stores
* Delivery Zones
* Villages
* Orders
* User Profile
* Seller Applications
* Cart

---

## Rule 2

Zustand is reserved for client-side state only.

Examples:

* Authentication session
* UI state
* Application settings
* Telegram integration state

---

## Rule 3

All backend communication must go through the Services Layer.

Components must never call Axios directly.

---

## Rule 4

Components should consume React Query hooks, not services.

Flow:

```text
Component
↓
React Query Hook
↓
Service
↓
Axios Client
↓
API
```

---

# State Ownership

## Server State

Managed by:

```text
TanStack Query
```

Includes:

```text
Products
Categories
Stores
Store Details
Delivery Zones
Villages
Cart
Orders
User Profile
Store Application
Banners
```

---

## Client State

Managed by:

```text
Zustand
```

Includes:

```text
Authentication
UI State
Telegram State
Application State
```

---

# Zustand Stores

## authStore

Purpose:

Manage authenticated session.

---

### State

```ts
user: User | null

accessToken: string | null

refreshToken: string | null

isAuthenticated: boolean

isLoading: boolean
```

---

### Actions

```ts
login()

logout()

refreshSession()

setUser()

clearUser()
```

---

### Persistence

Persist:

```text
accessToken
refreshToken
user
```

Storage:

```text
localStorage
```

---

# uiStore

Purpose:

Manage global UI behavior.

---

## State

```ts
isAuthModalOpen: boolean

isSearchOpen: boolean

selectedVillage: Village | null

selectedLocation: string | null

isMobileMenuOpen: boolean
```

---

## Actions

```ts
openAuthModal()

closeAuthModal()

setVillage()

setLocation()

toggleMobileMenu()
```

---

# appStore

Purpose:

Global application state.

---

## State

```ts
telegramMode: boolean

networkStatus: "online" | "offline"

appVersion: string
```

---

## Actions

```ts
setTelegramMode()

setNetworkStatus()
```

---

# telegramStore

Purpose:

Telegram Mini App integration.

---

## State

```ts
isTelegram: boolean

telegramUser: TelegramUser | null

themeParams: TelegramTheme | null

initData: string | null
```

---

## Actions

```ts
initializeTelegram()

setTelegramUser()

setTheme()
```

---

# Cart Architecture

## Important Rule

Cart is server-side state.

Cart data must not be stored in Zustand.

Cart data must not be persisted in localStorage.

Cart data is provided by backend endpoints.

---

## Backend Endpoints

```text
GET    /cart
POST   /cart/items
PATCH  /cart/items/{id}
DELETE /cart/items/{id}
DELETE /cart
```

---

## Cart Query

Query Key:

```ts
["cart"]
```

Purpose:

Retrieve full cart grouped by store.

---

## Cart Mutations

### Add Item

```ts
POST /cart/items
```

Mutation:

```ts
useAddCartItem()
```

---

### Update Quantity

```ts
PATCH /cart/items/{id}
```

Mutation:

```ts
useUpdateCartItem()
```

---

### Remove Item

```ts
DELETE /cart/items/{id}
```

Mutation:

```ts
useRemoveCartItem()
```

---

### Clear Cart

```ts
DELETE /cart
```

Mutation:

```ts
useClearCart()
```

---

## Cart Query Invalidation

After every successful cart mutation:

```ts
invalidateQueries(["cart"])
```

---

## Guest Users

Guest users cannot add products to cart.

When guest user clicks:

```text
Add To Cart
```

Behavior:

```text
Open Authentication Modal
```

No guest cart exists in MVP.

---

# TanStack Query

## Purpose

Own all backend state.

---

# Query Key Factory

Centralized query keys.

Location:

```text
src/constants/queryKeys.ts
```

---

## Categories

```ts
["categories"]
```

---

## Products

```ts
["products"]
```

---

## Product Detail

```ts
["product", productId]
```

---

## Stores

```ts
["stores"]
```

---

## Store Detail

```ts
["store", storeId]
```

---

## Villages

```ts
["villages"]
```

---

## Delivery Zones

```ts
["delivery-zones"]
```

---

## Cart

```ts
["cart"]
```

---

## Orders

```ts
["orders"]
```

---

## Order Detail

```ts
["order", orderId]
```

---

## Profile

```ts
["profile"]
```

---

## Seller Application

```ts
["seller-application"]
```

---

## Banners

```ts
["banners"]
```

---

# Query Configuration

Default configuration:

```ts
staleTime: 5 * 60 * 1000
gcTime: 10 * 60 * 1000
refetchOnWindowFocus: false
retry: 1
```

Reason:

Telegram Mini App users frequently switch applications.

---

# Infinite Queries

Use Infinite Query for:

```text
Products
Stores
Orders
```

Backend pagination:

```text
?page=1
?page=2
?page=3
```

---

# Authentication Flow

## Browser Login

```text
Login

↓

Receive JWT Tokens

↓

Store Tokens

↓

Fetch Profile

↓

Authenticated Session
```

---

## Browser Registration

Current backend flow:

```text
Register

↓

Receive Telegram Deep Link

↓

Open Telegram Bot

↓

Verification

↓

Login
```

Registration is not completed entirely inside the browser.

---

## Telegram Mini App Login

Future Feature.

Current backend does not provide:

```text
Telegram InitData → JWT
```

exchange endpoint.

Frontend must be architected for future support but not implement it.

---

# Seller Application State

Users do not become sellers immediately.

Flow:

```text
User

↓

Submit Store Application

↓

Pending

↓

Approved or Rejected
```

Frontend must support:

```text
Pending
Approved
Rejected
```

states.

---

# Route Protection

Protected Routes:

```text
/cart
/orders
/profile
/addresses
```

---

## Seller Routes

Require:

```text
Authenticated User
+
Approved Seller
```

Routes:

```text
/seller
/seller/products
/seller/orders
/seller/statistics
/seller/settings
```

---

# Services Layer

Location:

```text
src/services
```

Structure:

```text
auth.service.ts

product.service.ts

store.service.ts

cart.service.ts

order.service.ts

banner.service.ts

profile.service.ts

seller.service.ts

village.service.ts

deliveryZone.service.ts
```

---

# React Query Hooks

Location:

```text
src/features/*/hooks
```

Examples:

```text
useProducts()

useProduct()

useStores()

useStore()

useCart()

useOrders()

useProfile()

useSellerApplication()
```

---

# Error Handling

Standardized error format:

```ts
{
  message: string
  status: number
}
```

Technical backend errors must never be displayed directly to users.

---

# Loading Strategy

Every async screen must support:

* Loading State
* Success State
* Error State
* Empty State

Skeleton loaders are required wherever possible.

---

# Future Scalability

The architecture must support future features without major refactoring:

* Telegram Auto Login
* Online Payments
* Favorites
* Product Reviews
* Notifications
* Chat System
* Recommendation Engine

No future feature should require replacing Zustand or TanStack Query.
