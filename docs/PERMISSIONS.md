# PERMISSIONS.md

# SuxonaShop Permissions Architecture

Version: 1.0

Status: MVP

---

# 1. Purpose

This document defines authorization and permission rules for the entire SuxonaShop platform.

Permissions must be implemented using custom DRF permissions.

Permission logic must never be duplicated in views.

---

# 2. Roles

## Customer

Default user role.

Can:

* Browse products
* Browse stores
* Manage cart
* Manage addresses
* Create orders
* View own orders

Cannot:

* Manage stores
* Manage products
* Access admin features

---

## Seller

A user becomes a seller after owning an approved store.

Can:

* Manage own store
* Manage own products
* Manage own delivery zones
* Manage own orders

Cannot:

* Manage other stores
* Access admin features

---

## Admin

Can access all resources.

Can:

* Approve stores
* Manage categories
* Manage villages
* Manage banners
* Manage users

---

# 3. Permission Architecture

Location:

```text
apps/common/permissions/
```

Required permission classes:

```text
IsAuthenticatedUser

IsAdmin

IsSeller

IsStoreOwner

IsStoreOwnerOrAdmin

IsOrderOwner

IsOrderOwnerOrStoreOwner

ReadOnly
```

---

# 4. Base Permission Rules

## ReadOnly

Allows:

```text
GET
HEAD
OPTIONS
```

Blocks:

```text
POST
PUT
PATCH
DELETE
```

---

## IsAuthenticatedUser

Requires:

```text
request.user.is_authenticated
```

Used for:

* Cart
* Orders
* Addresses
* Profile

---

## IsAdmin

Requires:

```python
request.user.is_staff == True
```

Access:

```text
Admin APIs
Categories
Villages
Banners CRUD
Store Approvals
```

---

# 5. Seller Permissions

## IsSeller

User must own a store.

Rule:

```python
Store.objects.filter(
    owner=request.user,
    status="ACTIVE"
).exists()
```

Allows:

```text
Product Management
Delivery Zones
Seller Orders
Store Settings
```

---

## IsStoreOwner

Checks ownership.

Rule:

```python
store.owner_id == request.user.id
```

Allows:

```text
Update Store

Delete Product

Edit Product

Manage Delivery Zones
```

Denies:

```text
Other sellers
```

---

## IsStoreOwnerOrAdmin

Rule:

```text
Store Owner
OR
Admin
```

Used for:

```text
Store Management
Product Management
```

---

# 6. Order Permissions

## IsOrderOwner

Rule:

```python
order.customer_id == request.user.id
```

Used for:

```text
View Order
Cancel Order
```

Customer can access only their own orders.

---

## IsOrderOwnerOrStoreOwner

Rule:

```text
Customer owns order
OR
Seller owns store
OR
Admin
```

Used for:

```text
Order Detail
```

Examples:

Customer:

```text
Can view own order
```

Seller:

```text
Can view orders
for own store
```

Admin:

```text
Can view any order
```

---

# 7. Store Application Permissions

## Create Store Application

Requires:

```text
Authenticated User
```

Additional validation handled by service:

```text
User does not already own a store

User does not have pending application
```

---

## Approve Application

Requires:

```text
Admin
```

---

## Reject Application

Requires:

```text
Admin
```

---

# 8. Product Permissions

## Public Access

Everyone can:

```text
List Products

View Product Detail

Search Products
```

---

## Product Creation

Requires:

```text
Seller
```

---

## Product Update

Requires:

```text
Store Owner
```

Rule:

```python
product.store.owner_id
==
request.user.id
```

---

## Product Delete

Requires:

```text
Store Owner
```

---

# 9. Delivery Zone Permissions

## Read

Public.

Anyone can see delivery availability.

---

## Create

Requires:

```text
Store Owner
```

---

## Update

Requires:

```text
Store Owner
```

---

## Delete

Requires:

```text
Store Owner
```

---

# 10. Address Permissions

Addresses belong to users.

Rule:

```python
address.user_id == request.user.id
```

User may:

```text
Create

Update

Delete

List
```

only their own addresses.

---

# 11. Cart Permissions

Cart belongs to a user.

Rule:

```python
cart.user_id == request.user.id
```

User may:

```text
View Cart

Add Item

Remove Item

Update Quantity
```

only in their own cart.

---

# 12. Order Permissions

## Create Order

Requires:

```text
Authenticated User
```

---

## View Own Orders

Requires:

```text
Authenticated User
```

Additional filter:

```python
customer=request.user
```

---

## Cancel Order

Requires:

```text
Order Owner
```

Business Rule:

```text
Only PENDING orders
can be cancelled.
```

Status validation belongs to service layer.

---

# 13. Seller Order Permissions

Seller can access only orders belonging to their store.

Rule:

```python
order.store.owner_id
==
request.user.id
```

---

## Accept Order

Requires:

```text
Store Owner
```

---

## Reject Order

Requires:

```text
Store Owner
```

---

## Mark Delivering

Requires:

```text
Store Owner
```

---

## Complete Order

Requires:

```text
Store Owner
```

---

# 14. Category Permissions

Public:

```text
List Categories
```

Admin:

```text
Create

Update

Delete
```

---

# 15. Village Permissions

Public:

```text
List Villages
```

Admin:

```text
Create

Update

Delete
```

---

# 16. Banner Permissions

Public:

```text
View Banners
```

Admin:

```text
Create

Update

Delete
```

---

# 17. Telegram Account Permissions

User may manage only their own Telegram account.

Rule:

```python
telegram_account.user_id
==
request.user.id
```

---

# 18. Object-Level Permissions

Required for:

```text
Store

Product

Order

Address

TelegramAccount
```

Implementation:

```python
has_object_permission()
```

must be used.

---

# 19. Forbidden Practices

Do NOT:

```python
if order.customer != request.user:
    raise PermissionDenied
```

inside views.

Use DRF permission classes.

---

# 20. Service Layer Rule

Permissions verify:

```text
Who can perform action
```

Services verify:

```text
Whether action is valid
```

Example:

Permission:

```text
Seller owns order's store
```

Service:

```text
Order status can transition
from ACCEPTED
to DELIVERING
```

---

# 21. Final Rule

Authorization belongs to:

```text
Permissions
```

Business validation belongs to:

```text
Services
```

Database reads belong to:

```text
Selectors
```

This separation must be maintained throughout the project.
