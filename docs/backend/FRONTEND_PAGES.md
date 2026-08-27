# FRONTEND_PAGES.md

# SuxonaShop Frontend Pages Specification

Version: 1.0

Status: MVP

Frontend Stack:

* React
* Vite
* TypeScript
* React Router
* TanStack Query
* Axios

---

# 1. Application Structure

The application consists of:

```text
Public Pages

Customer Pages

Seller Dashboard

Admin Panel
```

---

# 2. Public Pages

Accessible without authentication.

---

## Home Page

Route:

```text
/
```

Purpose:

Marketplace landing page.

Sections:

```text
Header

Search

Banner Slider

Categories

Popular Stores

Latest Products

Footer
```

Actions:

```text
Search Product

Open Category

Open Store

Open Product
```

---

## Category Products

Route:

```text
/categories/:id
```

Purpose:

Display products belonging to a category.

Features:

```text
Pagination

Search

Sorting

Filtering
```

Filters:

```text
Price

Store

Availability
```

---

## Product Detail

Route:

```text
/products/:id
```

Sections:

```text
Images Gallery

Product Name

Price

Store Information

Description

Stock Status

Add To Cart Button
```

Actions:

```text
Add To Cart
```

---

## Store Detail

Route:

```text
/stores/:id
```

Sections:

```text
Store Banner

Store Logo

Store Information

Products Grid
```

Actions:

```text
Browse Products
```

---

# 3. Authentication Pages

---

## Login

Route:

```text
/login
```

Fields:

```text
Phone Number
```

Actions:

```text
Login
```

---

## Register

Route:

```text
/register
```

Fields:

```text
First Name

Last Name

Phone Number
```

Actions:

```text
Register
```

---

# 4. Customer Pages

Authentication Required.

---

## Profile

Route:

```text
/profile
```

Sections:

```text
Personal Information

Saved Addresses

Store Information (if seller)
```

Actions:

```text
Edit Profile

Manage Addresses
```

---

## Addresses

Route:

```text
/profile/addresses
```

Actions:

```text
Create Address

Edit Address

Delete Address

Set Default Address
```

---

## Cart

Route:

```text
/cart
```

Important Business Rule:

```text
Cart may contain products from multiple stores.
```

UI Structure:

```text
Store A

Products

Subtotal

Checkout Button

----------------

Store B

Products

Subtotal

Checkout Button
```

Actions:

```text
Increase Quantity

Decrease Quantity

Remove Product

Checkout Store
```

---

## Checkout

Route:

```text
/checkout/:storeId
```

Purpose:

Checkout products belonging to one store.

Sections:

```text
Selected Address

Delivery Price

Products

Order Summary

Order Note
```

Actions:

```text
Create Order
```

---

## Orders

Route:

```text
/orders
```

Tabs:

```text
All

Pending

Accepted

Delivering

Completed

Cancelled

Rejected
```

---

## Order Detail

Route:

```text
/orders/:id
```

Sections:

```text
Order Information

Store Information

Products

Delivery Address

Status Timeline
```

Actions:

```text
Cancel Order
```

Condition:

```text
Only Pending Orders
```

---

# 5. Seller Pages

Authentication Required.

Store Required.

---

## Seller Dashboard

Route:

```text
/seller
```

Cards:

```text
Products Count

Pending Orders

Completed Orders

Total Orders
```

---

## Products List

Route:

```text
/seller/products
```

Actions:

```text
Create Product

Edit Product

Hide Product

Delete Product
```

---

## Create Product

Route:

```text
/seller/products/create
```

Fields:

```text
Name

Description

Category

Price

Stock

Images
```

---

## Edit Product

Route:

```text
/seller/products/:id/edit
```

Actions:

```text
Update Product
```

---

## Seller Orders

Route:

```text
/seller/orders
```

Tabs:

```text
Pending

Accepted

Delivering

Completed

Rejected
```

---

## Seller Order Detail

Route:

```text
/ seller/orders/:id
```

Actions:

```text
Accept Order

Reject Order

Mark Delivering

Complete Order
```

---

## Delivery Zones

Route:

```text
/seller/delivery-zones
```

Actions:

```text
Add Village

Set Delivery Price

Disable Village
```

Example:

```text
Ravon      5000

Gaznov     10000

Qalacha    Free
```

---

## Store Settings

Route:

```text
/seller/settings
```

Fields:

```text
Store Name

Description

Logo

Banner

Phone

Telegram Username
```

---

# 6. Store Application Pages

---

## Create Store Application

Route:

```text
/create-store
```

Fields:

```text
Store Name

Phone
```

Actions:

```text
Submit Application
```

---

## Store Application Status

Route:

```text
/store-application
```

Statuses:

```text
Pending

Approved

Rejected
```

---

# 7. Admin Pages

Admin Only.

---

## Admin Dashboard

Route:

```text
/admin
```

Cards:

```text
Users

Stores

Products

Orders
```

---

## Store Applications

Route:

```text
/admin/store-applications
```

Actions:

```text
Approve

Reject
```

---

## Stores

Route:

```text
/admin/stores
```

Actions:

```text
Activate

Suspend
```

---

## Categories

Route:

```text
/admin/categories
```

CRUD Operations.

---

## Villages

Route:

```text
/admin/villages
```

CRUD Operations.

---

## Banners

Route:

```text
/admin/banners
```

CRUD Operations.

---

## Users

Route:

```text
/admin/users
```

Actions:

```text
View

Suspend
```

---

# 8. Shared Components

## Header

Contains:

```text
Logo

Search

Cart

Profile
```

---

## Footer

Contains:

```text
About

Contact

Terms
```

---

## Product Card

Fields:

```text
Image

Name

Price

Store Name

Add To Cart Button
```

---

## Store Card

Fields:

```text
Logo

Store Name

Products Count
```

---

## Banner Slider

Displays active banners.

---

## Order Status Badge

Statuses:

```text
Pending

Accepted

Delivering

Completed

Cancelled

Rejected
```

---

# 9. Responsive Design

Must support:

```text
Mobile First

Tablet

Desktop
```

Priority:

```text
Mobile
```

because most marketplace traffic is expected from mobile devices.

---

# 10. Future Pages (Not MVP)

Excluded from MVP:

```text
Wishlist

Reviews

Ratings

Coupons

Online Payments

Chat

AI Assistant

Courier Marketplace
```

These pages should not be implemented in version 1.0.
