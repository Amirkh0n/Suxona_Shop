# BACKEND_ARCHITECTURE.md

# SuxonaShop Backend Architecture

Version: 1.0

Status: MVP

---

# 1. Architecture Principles

The backend must follow:

* Django
* Django REST Framework
* PostgreSQL
* JWT Authentication
* Cloudflare R2 Storage

Architecture goals:

* Simple
* Maintainable
* Modular
* Scalable

The codebase must prioritize clarity over premature optimization.

---

# 2. Project Structure

```text
backend/

├── config/
│   ├── settings/
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── apps/
│   ├── accounts/
│   ├── stores/
│   ├── products/
│   ├── orders/
│   ├── banners/
│   ├── notifications/
│   └── common/
│
├── media/
├── static/
│
├── requirements/
│
├── docs/
│
└── manage.py
```

---

# 3. Apps Responsibilities

## accounts

Responsible for:

* User
* Address
* TelegramAccount
* Authentication
* Profile

Models:

```text
User
Address
TelegramAccount
```

---

## stores

Responsible for:

* Store
* StoreApplication
* DeliveryZone

Models:

```text
Store
StoreApplication
DeliveryZone
Village
```

---

## products

Responsible for:

* Product
* ProductImage
* Category

Models:

```text
Category
Product
ProductImage
```

---

## orders

Responsible for:

* Cart
* CartItem
* Order
* OrderItem

Models:

```text
Cart
CartItem
Order
OrderItem
```

Business logic:

* Cart management
* Checkout
* Order lifecycle

---

## banners

Responsible for:

```text
Banner
```

---

## notifications

Responsible for:

* Telegram notifications
* Future SMS support

---

## common

Shared functionality.

Contains:

```text
BaseModel
Enums
Permissions
Exceptions
Utilities
Constants
```

---

# 4. Layered Architecture

Each app should follow:

```text
app/

├── models/
├── serializers/
├── views/
├── services/
├── selectors/
├── permissions/
├── filters/
└── tests/
```

---

# 5. Business Logic Rules

Business logic must NOT live inside Views.

Bad:

```python
APIView
    -> 200 lines of logic
```

Good:

```python
APIView
    -> Service
        -> Business Logic
```

Example:

```python
CreateOrderService
AcceptOrderService
RejectOrderService
```

---

# 6. Selectors Pattern

All complex queries should use selectors.

Example:

```python
ProductSelector
StoreSelector
OrderSelector
```

Purpose:

* Reusable queries
* Cleaner views
* Easier testing

---

# 7. Services Pattern

All business workflows must use services.

Examples:

```python
CreateStoreApplicationService

ApproveStoreService

CreateOrderService

AcceptOrderService

RejectOrderService

CompleteOrderService
```

Views should only:

```text
Validate
Call Service
Return Response
```

---

# 8. Base Model

All models inherit from BaseModel.

```python
class BaseModel(models.Model):
    created_at
    updated_at
```

Abstract model.

---

# 9. Authentication

Authentication method:

```text
JWT
```

Library:

```text
djangorestframework-simplejwt
```

Endpoints:

```text
/login
/refresh
/me
```

---

# 10. Permissions

Use custom DRF permissions.

Examples:

```python
IsAdmin

IsStoreOwner

IsOrderOwner

IsStoreOwnerOrAdmin
```

Avoid permission logic inside views.

---

# 11. Media Storage

All uploaded files must be stored in:

```text
Cloudflare R2
```

Do NOT use local media storage in production.

Libraries:

```text
django-storages
boto3
```

---

# 12. Pagination

Global pagination.

Default:

```text
20 items
```

Maximum:

```text
100 items
```

---

# 13. Filtering

Use:

```text
django-filter
```

Examples:

Products:

```text
category
store
search
ordering
```

Orders:

```text
status
```

Stores:

```text
search
```

---

# 14. Search

Search fields:

Products:

```text
name
description
```

Stores:

```text
name
```

Categories:

```text
name
```

Use DRF SearchFilter.

---

# 15. Ordering

Products:

```text
price
created_at
```

Stores:

```text
created_at
```

Orders:

```text
created_at
```

---

# 16. API Versioning

Base path:

```text
/api/v1/
```

Future:

```text
/api/v2/
```

---

# 17. Error Handling

Standard response:

```json
{
  "detail": "Error message"
}
```

Validation:

```json
{
  "field_name": [
    "Error message"
  ]
}
```

---

# 18. Status Enums

## StoreStatus

```python
PENDING
ACTIVE
SUSPENDED
REJECTED
```

---

## ProductStatus

```python
DRAFT
ACTIVE
OUT_OF_STOCK
HIDDEN
```

---

## OrderStatus

```python
PENDING
ACCEPTED
DELIVERING
COMPLETED
CANCELLED
REJECTED
```

---

# 19. Checkout Workflow

Business rule:

```text
1 Cart = Multiple Stores

1 Order = 1 Store
```

Checkout algorithm:

```text
Receive store_id

Find all cart items
belonging to store_id

Create Order

Create OrderItems

Calculate delivery price

Calculate total

Remove only those
cart items

Keep remaining cart items
```

This logic must be implemented in:

```python
CreateOrderService
```

---

# 20. Notifications

MVP:

Telegram only.

Events:

```text
Order Created

Order Accepted

Order Rejected

Order Delivering

Order Completed
```

Use service layer.

Avoid direct calls from views.

---

# 21. Database Transactions

Critical operations must use:

```python
transaction.atomic()
```

Required for:

```python
CreateOrderService

ApproveStoreService

AcceptOrderService
```

---

# 22. Testing Strategy

Use:

```text
pytest
pytest-django
factory-boy
```

Required tests:

* Services
* Permissions
* API endpoints

Target:

```text
70%+ coverage
```

---

# 23. Logging

Use Django logging.

Log:

```text
Errors

Store approvals

Order creation

Order status changes
```

---

# 24. Security

Requirements:

* JWT Authentication
* Permission checks
* Serializer validation
* Rate limiting (future)
* Secure file uploads

Never trust client-side calculations.

Server calculates:

```text
subtotal

delivery_price

total
```

---

# 25. Future Extensions

Architecture must support:

* Reviews
* Ratings
* Favorites
* Online Payments
* AI Assistant
* Courier System
* Mobile Apps

without major refactoring.

---

# 26. Deployment Architecture

```text
Client
   ↓

Nginx
   ↓

Django + Gunicorn
   ↓

PostgreSQL

Cloudflare R2

Telegram Bot
```

---

# 27. Development Rules

Must use:

* Type hints
* DRF serializers
* Service layer
* Selectors
* Custom permissions

Avoid:

* Fat Views
* Business logic in serializers
* Raw SQL unless necessary

The backend should remain modular and maintainable as the marketplace grows.
