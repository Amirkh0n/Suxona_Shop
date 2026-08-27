# FRONTEND_IMPLEMENTATION_PROMPT.md

You are a senior Staff Frontend Engineer responsible for building the complete SuxonaShop frontend application.

Before writing any code, carefully read and understand all project documentation files.

Required documents:

```text
01-project-overview.md
02-ui-ux-specification.md
03-routing-and-navigation.md
04-api-integration.md
05-state-management.md
06-design-system.md
07-development-rules.md
schema.yml
```

The OpenAPI schema (`schema.yml`) is the single source of truth for backend integration.

If any documentation conflicts with the OpenAPI schema, the schema takes priority.

---

# Project Goal

Build a production-ready frontend for SuxonaShop.

SuxonaShop is a mobile-first multi-vendor marketplace optimized for:

* Telegram Mini Apps
* Mobile Browsers
* Desktop Browsers

The application must feel modern, fast, and professional.

The user experience should resemble modern e-commerce applications while remaining simple enough for non-technical users.

---

# Required Stack

Use only:

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
* Lucide React

Do not introduce unnecessary dependencies.

---

# Architecture Requirements

Follow the architecture described in:

```text
05-state-management.md
07-development-rules.md
```

Required:

* Feature-based architecture
* Strict TypeScript
* Reusable UI components
* Service layer abstraction
* Query hooks
* Zustand stores

Forbidden:

* Redux
* Context API for application state
* Direct Axios calls inside components
* Class components
* Any TypeScript "any" types

---

# UI Requirements

The UI must follow:

```text
02-ui-ux-specification.md
06-design-system.md
```

Requirements:

* Mobile-first
* Clean marketplace design
* Responsive layouts
* Skeleton loaders
* Empty states
* Error states

The provided marketplace mockups represent the desired visual direction.

Create a polished and modern interface.

Avoid generic template-style designs.

---

# Authentication

Implement JWT authentication.

Browser flow:

Phone Number

↓

Password

↓

JWT

↓

Authenticated Session

Support future Telegram Mini App authentication.

Architecture must be extensible.

---

# Marketplace Rules

The following business rules are mandatory.

Buyer and Seller share the same account.

Products belong to stores.

Orders belong to stores.

Cart may contain products from multiple stores.

Products inside cart must be grouped by store.

Checkout is performed per store.

When checkout succeeds:

* Purchased store items are removed
* Remaining store items stay in cart

Never violate these rules.

---

# API Integration

Use the OpenAPI schema to generate:

* Type definitions
* Service methods
* API contracts

Recommended flow:

OpenAPI Schema

↓

Types

↓

Services

↓

React Query Hooks

↓

Components

Avoid hardcoding response structures.

---

# Development Strategy

Implement the project in phases.

Do not attempt to build everything at once.

---

## Phase 1

Project Setup

Tasks:

* Create Vite application
* Configure TypeScript
* Configure Tailwind
* Configure React Router
* Configure Axios
* Configure Zustand
* Configure TanStack Query
* Configure folder structure

Deliverable:

Working project foundation.

---

## Phase 2

Core Infrastructure

Tasks:

* API Client
* Auth Store
* Cart Store
* Query Client
* Protected Routes
* Layout System

Deliverable:

Application shell.

---

## Phase 3

Shared UI Components

Tasks:

* Button
* Input
* Modal
* Sheet
* Badge
* Loader
* Product Card
* Store Card
* Empty State
* Error State

Deliverable:

Reusable component library.

---

## Phase 4

Public Marketplace Pages

Tasks:

* Home
* Search
* Product Detail
* Stores
* Store Detail

Deliverable:

Marketplace browsing experience.

---

## Phase 5

Authentication

Tasks:

* Login
* Register
* Session Persistence
* Route Protection

Deliverable:

Complete authentication flow.

---

## Phase 6

Cart & Checkout

Tasks:

* Cart
* Store Grouping
* Checkout
* Order Success

Deliverable:

Purchasing flow.

---

## Phase 7

Profile & Orders

Tasks:

* Profile
* Orders
* Addresses

Deliverable:

User account experience.

---

## Phase 8

Seller Dashboard

Tasks:

* Dashboard
* Product Management
* Order Management
* Statistics
* Store Settings

Deliverable:

Mobile seller experience.

---

# Coding Standards

Every implementation must:

* Be production-ready
* Be strongly typed
* Be reusable
* Be maintainable
* Follow SOLID principles where appropriate

Avoid shortcuts.

Avoid technical debt.

Prefer long-term maintainability.

---

# Output Requirements

For every implementation step:

1. Explain architectural decisions.
2. Show folder structure changes.
3. Generate complete code.
4. Ensure code compiles successfully.
5. Ensure TypeScript passes without errors.

Never generate pseudo-code.

Never leave TODO placeholders.

Generate real implementation code.

---

# Success Criteria

The final result should:

* Compile successfully
* Be mobile-first
* Match the design system
* Follow all business rules
* Integrate with the backend schema
* Be production-ready
* Be ready for deployment

Act as a senior frontend engineer building a real startup product, not a prototype.
