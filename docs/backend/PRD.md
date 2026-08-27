# PRD.md

# SuxonaShop Product Requirements Document (PRD)

Version: 1.0

Status: MVP

---

# 1. Overview

## Product Name

SuxonaShop

## Product Type

Local Marketplace Platform

## Goal

SuxonaShop is a marketplace platform that enables local sellers to create stores, publish products, receive customer orders, and deliver products within selected villages and regions.

The platform itself does not handle logistics or payments during the MVP phase.

Sellers are responsible for:

* Product management
* Delivery
* Payment collection

The platform is responsible for:

* Discovery
* Product catalog
* Cart management
* Order management
* Notifications

---

# 2. Problem Statement

Currently, local sellers mostly sell products through:

* Telegram groups
* WhatsApp groups
* Personal contacts

This creates several problems:

* Products are difficult to discover
* No structured catalog
* No centralized order management
* Difficult to compare products
* Difficult to track orders

SuxonaShop solves these problems by providing a dedicated marketplace platform.

---

# 3. Target Audience

## Sellers

Examples:

* Grocery stores
* Local markets
* Small retailers
* Construction material shops
* Electronics shops
* Household goods sellers

## Customers

Residents of villages and local communities who want a convenient way to browse and order products.

---

# 4. MVP Goals

The MVP must allow:

1. User registration
2. Store creation
3. Product publishing
4. Delivery zone management
5. Shopping cart management
6. Order creation
7. Order tracking
8. Telegram notifications
9. Admin moderation

---

# 5. User Roles

## Customer

Can:

* Browse products
* Search products
* Manage cart
* Create orders
* Track orders

Cannot:

* Create stores
* Manage products

---

## Seller

A customer becomes a seller after opening a store.

Can:

* Manage store
* Manage products
* Manage delivery zones
* Receive orders
* Update order status

---

## Admin

Can:

* Approve stores
* Manage villages
* Manage categories
* Manage banners
* Suspend stores
* View platform activity

---

# 6. Core Business Rules

## Store Ownership

Rule:

```text
1 User = Maximum 1 Store
```

---

## Order Ownership

Rule:

```text
1 Order = 1 Store
```

Orders can never contain products from multiple stores.

---

## Cart Rules

Rule:

```text
1 Cart = Multiple Stores
```

The cart may contain products from different stores.

Example:

Store A:

* Product 1
* Product 2

Store B:

* Product 3

The frontend must group cart items by store.

Each store section must have its own checkout button.

---

## Checkout Rules

When a customer clicks:

```text
Checkout Store A
```

Only Store A products are converted into an order.

Products from other stores remain in the cart.

---

## Payment Rules

MVP Payment Method:

```text
Cash On Delivery (COD)
```

The platform does not process payments.

The seller collects payment directly from the customer.

---

## Delivery Rules

The seller performs delivery.

The platform does not provide delivery services.

---

# 7. Store System

## Store Creation Flow

```text
User
 ↓
Submit Store Application
 ↓
Admin Review
 ↓
Approved
 ↓
Store Activated
```

---

## Store Statuses

```text
PENDING
ACTIVE
SUSPENDED
REJECTED
```

---

## Store Fields

* Name
* Description
* Logo
* Banner
* Phone
* Telegram Username

---

# 8. Product System

## Product Fields

* Name
* Description
* Price
* Category
* Stock
* Images

---

## Product Images

Minimum:

```text
1 image
```

Maximum:

```text
5 images
```

---

## Product Statuses

```text
DRAFT
ACTIVE
OUT_OF_STOCK
HIDDEN
```

---

## Product Moderation

For MVP:

Products become visible immediately.

Admin moderation happens only when necessary.

Users may report inappropriate products in future versions.

---

# 9. Categories

Categories are managed exclusively by Admin.

Sellers cannot create categories.

Examples:

* Food
* Drinks
* Electronics
* Construction Materials
* Clothing
* Household Goods

Nested categories are supported.

---

# 10. Villages

Villages are managed exclusively by Admin.

Sellers select villages from the predefined list.

Sellers cannot create villages.

---

# 11. Delivery Zones

Each store can define delivery availability and pricing.

Example:

```text
Ravon      5000
Gaznov     10000
Qalacha    0
```

Where:

```text
0 = Free Delivery
```

---

# 12. Shopping Cart

Each user has exactly one cart.

The cart supports products from multiple stores.

The UI must group products by store.

Example:

```text
Store A
- Product A
- Product B

[Checkout Store A]

Store B
- Product C

[Checkout Store B]
```

---

# 13. Order System

## Order Lifecycle

```text
PENDING
 ↓
ACCEPTED
 ↓
DELIVERING
 ↓
COMPLETED
```

Alternative outcomes:

```text
PENDING → CANCELLED

PENDING → REJECTED
```

---

## Order Statuses

```text
PENDING
ACCEPTED
DELIVERING
COMPLETED
CANCELLED
REJECTED
```

---

## Order Rules

Customers can cancel only:

```text
PENDING
```

orders.

Sellers may reject orders with a reason.

---

# 14. Address Management

Customers may save multiple addresses.

Address fields:

* Village
* Street
* House
* Landmark

One address can be marked as default.

---

# 15. Banner System

Managed by Admin.

Fields:

* Title
* Image
* URL
* Sort Order
* Active Status

Homepage displays active banners.

---

# 16. Notifications

MVP Notification Channel:

```text
Telegram Bot
```

Events:

* New Order
* Order Accepted
* Order Delivered
* Order Rejected

---

# 17. Admin Panel

## Store Management

* Approve Store
* Reject Store
* Suspend Store

---

## Category Management

CRUD

---

## Village Management

CRUD

---

## Banner Management

CRUD

---

## User Management

View and manage platform users.

---

# 18. Non-Functional Requirements

## Performance

Target:

* Up to 500 active users

---

## Availability

Target:

* 99% uptime

---

## Security

* Authentication required
* Permission-based access control
* Input validation
* Secure media storage

---

## Media Storage

Cloudflare R2

All product images and banners must be stored in Cloudflare R2.

---

# 19. Technology Stack

Backend:

* Python
* Django
* Django REST Framework

Database:

* PostgreSQL

Frontend:

* React
* Vite

Storage:

* Cloudflare R2

Notifications:

* Telegram Bot

Infrastructure:

* Docker
* Nginx

---

# 20. Out of Scope (Not MVP)

The following features are intentionally excluded:

* Online Payments
* Chat System
* Product Reviews
* Product Ratings
* Wishlist
* AI Features
* Courier Marketplace
* Mobile Applications

---

# 21. Future Roadmap

## V2

* Reviews
* Ratings
* Favorites
* Discounts

## V3

* AI Product Description Generator
* AI Moderation
* AI Admin Assistant

## V4

* Online Payments
* Courier System
* Mobile Apps
* Seller Subscription Plans

---

# 22. Final Marketplace Rules

```text
1 User = 1 Store

1 Cart = Many Stores

1 Order = 1 Store

Categories = Admin Only

Villages = Admin Only

Delivery Price = Seller Defined

Payment = Cash On Delivery

Seller Delivers Products Himself

Store Requires Admin Approval

Product Images Stored In Cloudflare R2
```
