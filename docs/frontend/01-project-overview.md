# SuxonaShop Frontend Project Overview

## Project Summary

SuxonaShop is a local marketplace platform designed for villages, districts, and small communities. The platform connects local sellers with nearby buyers through a simple mobile-first shopping experience.

The primary goal of SuxonaShop is to digitize local commerce and make ordering products from nearby stores as easy as sending a message in a messenger application.

The platform is optimized for mobile devices and is intended to be used primarily through Telegram Mini Apps, while also providing full browser support.

---

# Business Model

SuxonaShop operates as a multi-vendor marketplace.

Each seller owns a store and manages their own products, inventory, delivery areas, and customer orders.

Buyers can browse products from multiple stores, add products to a shared cart, and place orders directly with individual stores.

The platform does not provide centralized delivery services in the MVP phase. Delivery is handled by each seller independently.

---

# Target Platforms

## Primary Platform

Telegram Mini App

Reasons:

* Familiar environment for users
* No separate mobile application installation required
* Faster user onboarding
* Built-in Telegram authentication support

## Secondary Platform

Web Browser

Supported browsers:

* Chrome
* Edge
* Firefox
* Safari

The browser version must provide the same functionality as the Telegram Mini App.

---

# Frontend Technology Stack

Core Technologies:

* React
* TypeScript
* Vite

Routing:

* React Router

Server State Management:

* TanStack Query

Client State Management:

* Zustand

HTTP Client:

* Axios

Form Management:

* React Hook Form

Validation:

* Zod

Styling:

* Tailwind CSS

Icons:

* Lucide React

---

# Design Principles

The frontend must follow the principles below:

## Mobile First

All interfaces must be designed for mobile devices first.

Desktop layouts are secondary and should be responsive adaptations of the mobile design.

## Fast and Lightweight

The application should load quickly even on low-end Android devices and slow internet connections.

## Simplicity

The interface should be understandable for users with minimal technical knowledge.

Complex interactions should be avoided whenever possible.

## Marketplace Focused

The platform's primary purpose is helping users discover and purchase products from local stores.

Products should always remain the central focus of the user experience.

## Telegram-Friendly UX

The interface should feel natural inside Telegram Mini Apps.

Layouts, interactions, and navigation should be optimized for Telegram users.

---

# User Roles

## Guest

Guest users can:

* Browse products
* Browse stores
* Browse categories
* View banners and promotions
* Search products and stores

Guest users cannot:

* Add products to cart
* Create orders
* Access profile features

Authentication is required when attempting to add products to the cart or place an order.

---

## Buyer

Buyer users can:

* Manage their profile
* Add products to cart
* Place orders
* View order history
* Save favorite products and stores (future feature)

---

## Seller

Seller users can:

* Create and manage a store
* Manage products
* Receive orders
* Update order statuses
* View sales statistics

Buyer and Seller use the same account.

A user becomes a seller by creating a store.

No separate seller account system exists.

---

# Marketplace Structure

The platform follows the hierarchy below:

Store
└── Products

Products always belong to a store.

Orders always belong to a store.

Sellers manage products through their store.

---

# Cart Architecture

The shopping cart is global.

A cart may contain products from multiple stores.

Products must be visually grouped by store.

Example:

Store A

* Product 1
* Product 2

Store B

* Product 3
* Product 4

Each store group has its own checkout action.

---

# Checkout Rules

Checkout is always performed per store.

One order belongs to exactly one store.

When a checkout is completed:

* An order is created for the selected store
* Purchased products from that store are removed from the cart
* Products belonging to other stores remain in the cart

This rule is a core business requirement and must not be changed.

---

# Authentication

Browser Authentication:

* Phone number
* Password
* JWT Authentication

Telegram Authentication (Future Phase):

* Telegram Mini App auto-login
* Telegram User ID verification
* JWT token generation from Telegram identity

The frontend must be prepared for both authentication methods.

---

# Delivery Model

Each seller manages their own delivery process.

A store may define:

* Delivery areas
* Delivery price
* Minimum order amount
* Delivery availability

Delivery settings are store-specific.

There is no centralized delivery system in the MVP phase.

---

# Seller Dashboard

Seller functionality exists inside the main application.

No separate seller application or admin panel should be created.

Seller features include:

* Dashboard
* Products
* Orders
* Statistics
* Store Settings

The seller experience must be fully mobile-friendly.

---

# Development Goals

The frontend codebase should prioritize:

* Scalability
* Maintainability
* Type safety
* Component reusability
* Performance
* Clean architecture

All implementation decisions should align with these goals.

---

# MVP Scope

Included in MVP:

* Authentication
* Home Page
* Product Catalog
* Product Details
* Store Pages
* Shopping Cart
* Checkout
* Orders
* User Profile
* Seller Dashboard
* Product Management
* Order Management

Excluded from MVP:

* Online Payments
* Seller Ratings
* Product Reviews
* Favorites
* Chat System
* Push Notifications
* Recommendation Engine

These features may be added in future versions.
