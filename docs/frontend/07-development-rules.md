# SuxonaShop Frontend Development Rules

## Purpose

This document defines the mandatory development standards, architectural rules, coding conventions, and implementation requirements for the SuxonaShop frontend.

All generated code must follow these rules.

If a conflict exists between convenience and these rules, these rules take priority.

---

# General Principles

The codebase must prioritize:

* Readability
* Maintainability
* Scalability
* Type Safety
* Performance
* Consistency

Code should be written for long-term maintenance, not short-term speed.

---

# Technology Stack

Required stack:

* React
* TypeScript
* Vite
* React Router
* TanStack Query
* Zustand
* Axios
* Tailwind CSS
* React Hook Form
* Zod

Do not introduce alternative frameworks without explicit approval.

---

# TypeScript Rules

## Strict Mode

TypeScript strict mode must always be enabled.

---

## No Any

Forbidden:

```ts
any
```

Always create proper types.

Use:

```ts
interface
```

or

```ts
type
```

---

## Explicit Types

Public interfaces must always be typed.

Examples:

* API responses
* Props
* Store states
* Service methods

---

## Shared Types

All reusable types must be stored inside:

```text
src/types
```

Examples:

```text
src/types/user.ts
src/types/product.ts
src/types/store.ts
src/types/order.ts
```

---

# Project Structure

Feature-based architecture is required.

Structure:

```text
src/

├── app/
├── pages/
├── features/
├── components/
├── services/
├── hooks/
├── stores/
├── types/
├── utils/
├── routes/
├── layouts/
├── assets/
└── constants/
```

---

# Component Rules

## Functional Components Only

Allowed:

```tsx
function ProductCard() {}
```

or

```tsx
const ProductCard = () => {}
```

Forbidden:

```tsx
class ProductCard extends React.Component
```

---

## Single Responsibility

One component should have one purpose.

Avoid large multi-purpose components.

---

## Reusability

Reusable UI elements belong in:

```text
src/components/ui
```

Examples:

* Button
* Input
* Modal
* Badge
* Card

---

## Feature Components

Feature-specific components belong inside:

```text
src/features
```

Example:

```text
features/cart/components
features/product/components
features/store/components
```

---

# State Management Rules

## Zustand

Use only for client-side state.

Examples:

* Authentication
* Cart
* UI State

Never store API resources in Zustand.

---

## TanStack Query

Use for all server state.

Examples:

* Products
* Categories
* Orders
* Stores
* Profile

Never duplicate server state.

---

# API Rules

## Services Layer Required

Components must never call Axios directly.

Forbidden:

```tsx
axios.get(...)
```

inside components.

---

## Service Structure

Required:

```text
services/

auth.service.ts
product.service.ts
store.service.ts
order.service.ts
```

---

## Query Hooks

All API interactions should be wrapped in custom hooks.

Example:

```text
hooks/

useProducts.ts
useProduct.ts
useStores.ts
useOrders.ts
```

---

# Routing Rules

All routes must be defined centrally.

Required location:

```text
src/routes
```

Avoid hardcoded routes throughout the application.

---

# Authentication Rules

Authentication state must be managed centrally.

Use route guards for protected pages.

Protected routes:

```text
/cart
/orders
/profile
/seller
```

Guest users should never access seller features.

---

# Form Rules

Use:

```text
React Hook Form
```

for all forms.

Use:

```text
Zod
```

for validation.

Do not use manual validation logic when Zod can be used.

---

# Styling Rules

## Tailwind Only

Use Tailwind CSS utilities.

Avoid custom CSS files unless absolutely necessary.

---

## Consistency

Always follow the Design System.

Do not invent:

* New colors
* New spacing values
* New border radius values

outside Design System definitions.

---

## Responsive First

All screens must work correctly on:

```text
320px
375px
768px
1280px
```

Mobile layout always has priority.

---

# Naming Conventions

## Components

PascalCase

Example:

```text
ProductCard.tsx
StoreCard.tsx
CartItem.tsx
```

---

## Hooks

Prefix:

```text
use
```

Example:

```text
useProducts
useCart
useStore
```

---

## Stores

Suffix:

```text
Store
```

Example:

```text
authStore
cartStore
uiStore
```

---

## Constants

UPPER_SNAKE_CASE

Example:

```ts
MAX_CART_ITEMS
API_TIMEOUT
```

---

# Error Handling

All API failures must be handled gracefully.

Users must never see raw server errors.

Bad:

```text
500 Internal Server Error
```

Good:

```text
Something went wrong. Please try again.
```

---

# Loading States

Every asynchronous page must support:

* Loading State
* Success State
* Error State
* Empty State

Never leave users with a blank screen.

---

# Accessibility Rules

Minimum touch target:

```text
44px × 44px
```

Buttons and inputs must be keyboard accessible.

Use semantic HTML whenever possible.

---

# Performance Rules

## Lazy Loading

All page-level routes must be lazy loaded.

Use:

```tsx
React.lazy()
```

---

## Code Splitting

Large features should be split into separate bundles.

---

## Memoization

Use:

```tsx
useMemo
useCallback
React.memo
```

only when measurable benefits exist.

Avoid premature optimization.

---

# Logging Rules

Do not leave debugging statements in production.

Forbidden:

```ts
console.log()
console.error()
console.warn()
```

before release.

---

# Security Rules

Never store sensitive information in localStorage except authentication tokens.

Never expose secrets in frontend code.

Never hardcode API credentials.

All authentication requests must use HTTPS.

---

# Git Rules

Commit messages should follow:

```text
feat:
fix:
refactor:
style:
docs:
chore:
```

Examples:

```text
feat: add cart page

fix: resolve login redirect issue

refactor: extract product card component
```

---

# AI Coding Rules

When generating code:

1. Follow TypeScript strict mode.
2. Follow feature-based architecture.
3. Reuse existing components whenever possible.
4. Do not create duplicate implementations.
5. Respect the Design System.
6. Use Zustand only for client state.
7. Use TanStack Query only for server state.
8. Prefer composition over duplication.
9. Keep components small and focused.
10. Generate production-ready code.

These rules are mandatory for all future development.
