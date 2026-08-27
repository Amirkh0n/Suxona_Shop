# PROJECT_STRUCTURE.md

# SuxonaShop Project Structure

Version: 1.0

Status: MVP

---

# 1. Purpose

This document defines the required folder and file structure for the SuxonaShop project.

All AI agents and developers must follow this structure.

The goal is:

* Consistency
* Maintainability
* Scalability
* Clear separation of concerns

---

# 2. Repository Structure

```text
suxonashop/

├── backend/
├── frontend/
├── docs/
├── docker/
├── .github/
├── .env.example
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

# 3. Backend Structure

```text
backend/

├── manage.py
│
├── config/
│
├── apps/
│
├── requirements/
│
├── docs/
│
├── tests/
│
├── media/
│
└── static/
```

---

# 4. Django Config Structure

```text
config/

├── settings/
│   ├── base.py
│   ├── local.py
│   └── production.py
│
├── urls.py
├── asgi.py
└── wsgi.py
```

Rules:

* Never place all settings in one file.
* Environment-specific settings must be separated.

---

# 5. Apps Directory

All business logic must live inside:

```text
apps/
```

Each domain has its own app.

Required apps:

```text
accounts
stores
products
orders
banners
notifications
common
```

---

# 6. Accounts App

```text
accounts/

├── models/
│   ├── user.py
│   ├── address.py
│   └── telegram_account.py
│
├── serializers/
├── services/
├── selectors/
├── permissions/
├── views/
├── urls.py
└── tests/
```

Responsibilities:

* User management
* Authentication
* Addresses
* Telegram linking

---

# 7. Stores App

```text
stores/

├── models/
│   ├── store.py
│   ├── store_application.py
│   ├── village.py
│   └── delivery_zone.py
│
├── serializers/
├── services/
├── selectors/
├── permissions/
├── views/
├── urls.py
└── tests/
```

Responsibilities:

* Stores
* Store applications
* Delivery zones
* Villages

---

# 8. Products App

```text
products/

├── models/
│   ├── category.py
│   ├── product.py
│   └── product_image.py
│
├── serializers/
├── services/
├── selectors/
├── filters/
├── permissions/
├── views/
├── urls.py
└── tests/
```

Responsibilities:

* Categories
* Products
* Product images

---

# 9. Orders App

```text
orders/

├── models/
│   ├── cart.py
│   ├── cart_item.py
│   ├── order.py
│   └── order_item.py
│
├── serializers/
├── services/
├── selectors/
├── permissions/
├── views/
├── urls.py
└── tests/
```

Responsibilities:

* Cart
* Checkout
* Orders

---

# 10. Banners App

```text
banners/

├── models/
│   └── banner.py
│
├── serializers/
├── views/
├── urls.py
└── tests/
```

Responsibilities:

* Homepage banners

---

# 11. Notifications App

```text
notifications/

├── telegram/
│   ├── client.py
│   ├── templates.py
│   └── services.py
│
└── tests/
```

Responsibilities:

* Telegram notifications

Future:

* SMS
* Email

---

# 12. Common App

```text
common/

├── models/
│   └── base.py
│
├── enums/
│   ├── order_status.py
│   ├── product_status.py
│   └── store_status.py
│
├── permissions/
├── exceptions/
├── constants/
├── utils/
└── tests/
```

Responsibilities:

Shared code.

---

# 13. Models Structure

Never use:

```text
models.py
```

for large domains.

Instead use:

```text
models/

├── product.py
├── category.py
└── product_image.py
```

Rule:

```text
One model per file.
```

---

# 14. Views Structure

Never create huge views.

Preferred:

```text
views/

├── product_list.py
├── product_detail.py
├── product_create.py
└── product_update.py
```

Avoid:

```text
views.py
```

containing hundreds of lines.

---

# 15. Services Structure

Business logic must live in:

```text
services/
```

Example:

```text
services/

├── create_order.py
├── accept_order.py
├── reject_order.py
└── complete_order.py
```

Rule:

Business logic must not live in:

* Views
* Serializers

---

# 16. Selectors Structure

Database queries should be reusable.

Example:

```text
selectors/

├── product_selector.py
├── store_selector.py
└── order_selector.py
```

Purpose:

* Reusable queries
* Cleaner views
* Easier testing

---

# 17. Tests Structure

Each app must have its own tests.

Example:

```text
tests/

├── test_models.py
├── test_services.py
├── test_permissions.py
└── test_api.py
```

Rule:

Every service must be tested.

---

# 18. Frontend Structure

Frontend must follow Feature-Sliced Design principles.

```text
frontend/

├── public/
│
├── src/
│
├── tests/
│
└── vite.config.ts
```

---

# 19. Frontend src Structure

```text
src/

├── app/
├── pages/
├── widgets/
├── features/
├── entities/
├── shared/
└── routes/
```

---

# 20. App Layer

```text
app/

├── providers/
├── store/
├── router/
└── styles/
```

Contains application bootstrap logic.

---

# 21. Pages Layer

```text
pages/

├── HomePage/
├── ProductPage/
├── StorePage/
├── CartPage/
├── OrdersPage/
├── SellerDashboard/
└── AdminDashboard/
```

Rule:

Pages contain layout only.

---

# 22. Widgets Layer

Reusable page sections.

Examples:

```text
BannerSlider

ProductGrid

StoreGrid

OrderList
```

---

# 23. Features Layer

Business actions.

Examples:

```text
AddToCart

Checkout

CreateOrder

Login

CreateStore
```

---

# 24. Entities Layer

Domain entities.

Examples:

```text
Product

Store

Order

Category

User
```

Contains:

* Types
* Models
* API hooks

---

# 25. Shared Layer

Reusable utilities.

Examples:

```text
UI Components

Helpers

Hooks

Constants

Icons
```

---

# 26. Documentation Structure

```text
docs/

├── PRD.md
├── DATABASE_SCHEMA.md
├── API_SPEC.md
├── BACKEND_ARCHITECTURE.md
├── FRONTEND_PAGES.md
└── PROJECT_STRUCTURE.md
```

All AI agents must read these documents before generating code.

---

# 27. Mandatory Development Rules

Required:

* Type hints
* Service layer
* Selectors
* Custom permissions
* Tests

Forbidden:

* Fat Views
* Business logic inside serializers
* Monolithic files
* Hardcoded constants

---

# 28. Final Rule

The codebase must remain modular.

Every new feature should be implemented without breaking the existing architecture.

The project structure defined in this document is considered authoritative and must be followed by all contributors and AI agents.
