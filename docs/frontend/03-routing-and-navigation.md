# SuxonaShop Routing & Navigation Specification

## Purpose

This document defines the complete navigation structure, route hierarchy, access control, and user flow architecture for the SuxonaShop frontend application.

The goal is to provide a predictable and scalable navigation experience across Telegram Mini Apps and browser environments.

---

# Navigation Philosophy

The navigation system must be:

* Mobile-first
* Easy to understand
* Consistent
* Discoverable
* Marketplace-oriented

Users should always be able to reach primary marketplace functionality within one or two interactions.

---

# Primary Navigation

The application uses a fixed bottom navigation bar.

The bottom navigation remains visible on all primary user screens.

---

## Bottom Navigation Tabs

### Home

Route:

```text
/
```

Purpose:

* Product discovery
* Promotions
* Categories
* Popular products
* Nearby stores

---

### Search

Route:

```text
/search
```

Purpose:

* Product search
* Store search

---

### Cart

Route:

```text
/cart
```

Purpose:

* Cart management
* Checkout initiation

---

### Stores

Route:

```text
/stores
```

Purpose:

* Browse all stores

---

### Profile

Route:

```text
/profile
```

Purpose:

* Account management
* Orders
* Seller access

---

# Route Categories

The application contains four route groups.

---

## Public Routes

Accessible without authentication.

```text
/
/search
/stores
/store/:slug
/product/:id
/login
/register
```

---

## Authenticated Routes

Require user authentication.

```text
/checkout/:storeId
/cart
/orders
/profile
/addresses
```

---

## Seller Routes

Require:

* Authentication
* Active Seller Account

```text
/seller
/seller/products
/seller/products/create
/seller/products/:id/edit
/seller/orders
/seller/orders/:id
/seller/statistics
/seller/settings
```

---

## System Routes

```text
/not-found
/unauthorized
```

---

# Route Hierarchy

## Home Flow

```text
Home
├── Product Detail
├── Category Products
└── Store Detail
```

---

## Store Flow

```text
Stores
├── Store Detail
│   ├── Product Detail
│   └── Category Filter
```

---

## Search Flow

```text
Search
├── Product Results
├── Store Results
├── Product Detail
└── Store Detail
```

---

## Cart Flow

```text
Cart
├── Store Checkout
└── Order Success
```

---

## Orders Flow

```text
Orders
├── Order Detail
└── Order Tracking
```

---

## Seller Flow

```text
Seller Dashboard
├── Products
│   ├── Create Product
│   ├── Edit Product
│   └── Delete Product
│
├── Orders
│   ├── Order Detail
│   └── Status Updates
│
├── Statistics
│
└── Settings
```

---

# Route Definitions

## Home

Route:

```text
/
```

Description:

Main marketplace landing page.

---

## Search

Route:

```text
/search
```

Description:

Search products and stores.

Query Parameters:

```text
?q=phone
```

Example:

```text
/search?q=shirt
```

---

## Category Products

Route:

```text
/category/:slug
```

Example:

```text
/category/clothing
```

Description:

Display products belonging to a category.

---

## Product Detail

Route:

```text
/product/:id
```

Example:

```text
/product/125
```

Description:

Display complete product information.

---

## Stores List

Route:

```text
/stores
```

Description:

Browse all stores.

---

## Store Detail

Route:

```text
/store/:slug
```

Example:

```text
/store/asil-market
```

Description:

Display store information and products.

---

# Authentication Routes

## Login

Route:

```text
/login
```

Description:

Phone number and password login.

---

## Register

Route:

```text
/register
```

Description:

Create new account.

---

## Telegram Verification

Future Route:

```text
/auth/telegram
```

Description:

Telegram Mini App authentication flow.

---

# Cart Routes

## Cart

Route:

```text
/cart
```

Description:

Display grouped cart items.

Authentication Required:

Yes

---

## Checkout

Route:

```text
/checkout/:storeId
```

Example:

```text
/checkout/5
```

Description:

Checkout products belonging to a single store.

Authentication Required:

Yes

---

## Checkout Success

Route:

```text
/order-success/:orderId
```

Description:

Display successful order confirmation.

---

# Orders Routes

## Orders

Route:

```text
/orders
```

Description:

Display user order history.

Authentication Required:

Yes

---

## Order Detail

Route:

```text
/orders/:id
```

Description:

Display complete order information.

Authentication Required:

Yes

---

# Profile Routes

## Profile

Route:

```text
/profile
```

Description:

User profile and settings.

Authentication Required:

Yes

---

## Addresses

Route:

```text
/addresses
```

Description:

Manage delivery addresses.

Authentication Required:

Yes

---

# Seller Routes

## Dashboard

Route:

```text
/seller
```

Description:

Seller overview dashboard.

---

## Products

Route:

```text
/seller/products
```

Description:

Manage products.

---

## Create Product

Route:

```text
/seller/products/create
```

Description:

Create new product.

---

## Edit Product

Route:

```text
/seller/products/:id/edit
```

Description:

Update product information.

---

## Orders

Route:

```text
/seller/orders
```

Description:

Manage incoming orders.

---

## Order Detail

Route:

```text
/seller/orders/:id
```

Description:

Seller order details.

---

## Statistics

Route:

```text
/seller/statistics
```

Description:

Revenue and sales analytics.

---

## Store Settings

Route:

```text
/seller/settings
```

Description:

Store configuration.

---

# Access Control

## Guest User

Can Access:

```text
/
/search
/stores
/store/:slug
/product/:id
/login
/register
```

Cannot Access:

```text
/cart
/checkout/*
/orders
/profile
/seller/*
```

---

## Authenticated User

Can Access:

```text
/cart
/orders
/profile
/addresses
```

---

## Seller

Can Access:

All authenticated routes plus:

```text
/seller/*
```

---

# Navigation Behavior

## Product Card Click

Navigate:

```text
/product/:id
```

---

## Store Card Click

Navigate:

```text
/store/:slug
```

---

## Add To Cart (Guest)

Behavior:

Open Authentication Modal.

Do not redirect immediately.

---

## Add To Cart (Authenticated)

Behavior:

Add item to cart.

Display success feedback.

---

# Deep Linking

The application must support direct access to:

```text
/product/:id
/store/:slug
/orders/:id
```

when opened from:

* Browser
* Telegram Mini App
* Shared Links

---

# Not Found Handling

Unknown routes must redirect to:

```text
/404
```

and display a custom Not Found page.

---

# Future Route Expansion

The routing architecture should support future features:

```text
/favorites
/reviews
/chat
/notifications
/payment-methods
```

without requiring major navigation restructuring.
