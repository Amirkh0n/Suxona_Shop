# SuxonaShop UI/UX Specification

## Overview

This document defines the complete user interface and user experience requirements for the SuxonaShop frontend application.

All screens must follow a mobile-first approach and be optimized primarily for Telegram Mini Apps while maintaining full browser compatibility.

The provided design mockups represent the desired visual direction and interaction style.

---

# Global Layout

## Application Structure

The application consists of:

* Top Header
* Main Content Area
* Bottom Navigation

The Bottom Navigation must remain visible on all primary screens.

Exceptions:

* Login
* Register
* Checkout Flow
* Seller Onboarding

---

# Bottom Navigation

The application must contain five primary navigation tabs.

## Tabs

### Home

Purpose:

* Discover products
* Browse categories
* View promotions

Icon:

* Home

Route:

```text
/
```

---

### Search

Purpose:

* Search products
* Search stores

Icon:

* Search

Route:

```text
/search
```

---

### Cart

Purpose:

* View grouped cart items
* Checkout by store

Icon:

* Shopping Cart

Route:

```text
/cart
```

---

### Stores

Purpose:

* Browse all stores

Icon:

* Store

Route:

```text
/stores
```

---

### Profile

Purpose:

* User account
* Orders
* Seller features

Icon:

* User

Route:

```text
/profile
```

---

# Home Page

Route:

```text
/
```

## Purpose

The Home Page is the primary discovery screen.

Users should be able to:

* Search products
* Browse categories
* Discover stores
* View promotions
* Find products quickly

---

## Sections

### Header

Contains:

* SuxonaShop Logo
* Current Location
* Notification Button

Location selector should be clickable.

---

### Search Bar

Position:

Immediately below the header.

Placeholder:

```text
Nima qidiryapsiz?
```

Clicking opens Search Page.

---

### Banner Carousel

Displays:

* Promotions
* Seasonal offers
* Featured stores

Supports swipe gestures.

---

### Categories Section

Displays category icons in a grid.

Example:

* Food
* Clothing
* Electronics
* Home
* Beauty
* Sports

Categories should be visually simple and easy to scan.

---

### Popular Products

Horizontal section.

Contains:

Product Cards.

---

### Nearby Stores

Horizontal section.

Displays stores available in the user's selected location.

---

### New Products

Grid layout.

Displays recently added products.

---

# Search Page

Route:

```text
/search
```

## Layout

### Search Input

Sticky at top.

Search begins after user input.

---

### Search Results Tabs

Tabs:

* Products
* Stores

Default:

Products

---

### Product Results

Grid layout.

Uses Product Card component.

---

### Store Results

Vertical list.

Uses Store Card component.

---

# Product Listing Page

Route:

```text
/catalog/:categorySlug
```

## Layout

### Search Bar

Visible at top.

---

### Filters

Supports:

* Category
* Price Range
* Store
* Delivery Area

---

### Sorting

Options:

* Newest
* Price Low to High
* Price High to Low
* Most Popular

---

### Product Grid

Two-column mobile layout.

Uses Product Card component.

---

# Product Card

Used throughout application.

## Required Elements

Product Image

Product Name

Price

Store Name

Favorite Button

Add To Cart Button

---

## Behavior

Clicking card:

Opens Product Detail Page.

Clicking Add To Cart:

If authenticated:

Add product to cart.

If guest:

Show authentication modal.

---

# Product Detail Page

Route:

```text
/product/:id
```

## Sections

### Product Gallery

Supports:

* Multiple images
* Swipe gestures

---

### Product Information

Displays:

* Product Name
* Price
* Store Name
* Store Rating
* Product Rating (future)

---

### Delivery Information

Displays:

* Delivery Area
* Delivery Cost
* Minimum Order Amount

Store-specific information.

---

### Variants

Optional:

* Color
* Size
* Weight

---

### Description

Full product description.

---

### Add To Cart Button

Sticky bottom button.

Always visible.

---

# Stores Page

Route:

```text
/stores
```

## Purpose

Browse all stores.

---

## Layout

### Search

Store search input.

---

### Store List

Uses Store Card component.

---

# Store Card

Displays:

* Store Logo
* Store Name
* Store Rating
* Delivery Information
* Product Count

Clicking opens Store Page.

---

# Store Detail Page

Route:

```text
/store/:slug
```

## Sections

### Store Header

Displays:

* Cover Image
* Logo
* Store Name
* Rating
* Delivery Information

---

### Store Categories

Tabs for store categories.

---

### Store Products

Grid layout.

Uses Product Card component.

---

# Cart Page

Route:

```text
/cart
```

## Core Rule

Products are grouped by store.

Cart can contain products from multiple stores.

Checkout is performed per store.

---

## Layout

Store Group

Contains:

* Store Name
* Cart Items
* Store Total
* Delivery Cost
* Minimum Order Information
* Checkout Button

---

## Checkout Button

Creates order only for that store.

After successful checkout:

* Store products are removed from cart
* Other store products remain

---

# Checkout Flow

Route:

```text
/checkout/:storeId
```

Multi-step process.

---

## Step 1

Delivery Method

Options:

* Delivery
* Pickup

---

## Step 2

Contact Information

Fields:

* Full Name
* Phone Number
* Notes

---

## Step 3

Order Review

Displays:

* Products
* Delivery Cost
* Total Amount

---

## Final Step

Confirm Order

Success screen displayed after creation.

---

# Orders Page

Route:

```text
/orders
```

## Order Statuses

New

Confirmed

Preparing

On The Way

Delivered

Cancelled

---

## Order Card

Displays:

* Order Number
* Store Name
* Product Preview
* Total Amount
* Status

---

# Profile Page

Route:

```text
/profile
```

## Guest State

Displays:

* Login
* Register

---

## Authenticated State

Displays:

* User Information
* Orders
* Addresses
* Settings
* Logout

---

## Seller Access

If user is not a seller:

Show:

```text
Become a Seller
```

If user is a seller:

Show:

```text
Seller Dashboard
```

---

# Seller Dashboard

Route:

```text
/seller
```

## Dashboard Overview

Displays:

* Total Orders
* Revenue
* Active Products

---

## Navigation

Products

Orders

Statistics

Store Settings

---

# Seller Products

Route:

```text
/seller/products
```

Features:

* Product List
* Add Product
* Edit Product
* Delete Product

---

# Seller Orders

Route:

```text
/seller/orders
```

Features:

* Order List
* Status Updates
* Order Details

---

# Empty States

Every page must have proper empty states.

Examples:

No Products

No Orders

Empty Cart

No Search Results

---

# Loading States

Every API request must have:

* Skeleton Loader
* Loading Placeholder

Avoid blank screens.

---

# Error States

All API failures must display:

* Friendly Error Message
* Retry Button

Technical errors must never be shown directly to users.
