# SuxonaShop Architecture

## System Architecture Overview

SuxonaShop follows a **modular monolithic architecture** with clear separation of concerns between frontend and backend. The backend is organized by business domain (apps), while the frontend follows a feature-based structure.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Browser (Mobile/Desktop)                                        │
│    └── React 19 Application                                      │
│         ├── Pages (Pages)                                        │
│         ├── Components (Reusable UI)                             │
│         ├── Features (Domain Logic)                              │
│         ├── Hooks (Custom Hooks)                                 │
│         └── Services (API Calls)                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (REST)                              │
├─────────────────────────────────────────────────────────────────┤
│  React Router 7                                                 │
│    ├── Public Routes                                             │
│    ├── Protected Routes                                          │
│    └── Seller Routes                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BFF LAYER (Axios)                            │
├─────────────────────────────────────────────────────────────────┤
│  API Client                                                      │
│    ├── Request Interceptor (Token attachment)                   │
│    └── Response Interceptor (Error handling)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER (Django)                     │
├─────────────────────────────────────────────────────────────────┤
│  Django REST Framework                                           │
│    ├── Views (API Endpoints)                                     │
│    ├── Serializers (Data Validation)                             │
│    ├── Services (Business Logic)                                 │
│    ├── Selectors (Data Access)                                   │
│    └── Permissions (Access Control)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL 16                                                  │
│    ├── Models (Database Schema)                                  │
│    ├── Migrations (Database Schema Evolution)                    │
│    └── QuerySets (Database Operations)                           │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Architecture

### 1. Project Structure

```
backend/
├── config/                    # Django configuration
│   ├── settings/             # Settings modules
│   │   ├── base.py           # Base settings
│   │   ├── local.py          # Local development
│   │   └── production.py     # Production settings
│   ├── urls.py               # Root URL configuration
│   └── wsgi.py               # WSGI entry point
│
├── apps/                      # Django apps (business modules)
│   ├── accounts/             # User management
│   │   ├── models/           # User, Address, TelegramAccount
│   │   ├── views/            # Authentication, Address, Telegram
│   │   ├── services/         # User registration, verification
│   │   ├── serializers/      # Data serialization
│   │   ├── selectors/        # Data access patterns
│   │   └── permissions/      # Permission decorators
│   │
│   ├── products/             # Product management
│   │   ├── models/           # Category, Product, ProductImage
│   │   ├── views/            # Product CRUD, category
│   │   ├── services/         # Product creation, updates
│   │   ├── serializers/      # Product serialization
│   │   ├── selectors/        # Product queries
│   │   └── filters/          # Product filtering
│   │
│   ├── stores/               # Store management
│   │   ├── models/           # Store, DeliveryZone, Village
│   │   ├── views/            # Store CRUD, applications
│   │   ├── services/         # Store creation, delivery zones
│   │   ├── serializers/      # Store serialization
│   │   └── selectors/        # Store queries
│   │
│   ├── orders/               # Order and cart management
│   │   ├── models/           # Cart, CartItem, Order, OrderItem
│   │   ├── views/            # Cart, orders, seller orders
│   │   ├── services/         # Order creation, cart management
│   │   ├── serializers/      # Order serialization
│   │   └── selectors/        # Order queries
│   │
│   ├── banners/              # Banner management
│   │   ├── models/           # Banner
│   │   ├── views/            # Banner CRUD
│   │   ├── services/         # Banner management
│   │   ├── serializers/      # Banner serialization
│   │   └── selectors/        # Banner queries
│   │
│   ├── notifications/        # Notifications
│   │   └── telegram/         # Telegram bot integration
│   │       ├── client.py     # Telegram API client
│   │       ├── services.py   # Telegram services
│   │       └── templates.py  # Message templates
│   │
│   └── common/               # Shared utilities
│       ├── models/           # BaseModel
│       ├── enums/            # Enum definitions
│       ├── permissions/      # Common permissions
│       ├── exceptions/       # Custom exceptions
│       └── utils/            # Helper functions
│
├── media/                     # Uploaded media files
├── staticfiles/              # Static files (collectstatic)
├── tests/                    # Tests
└── requirements/             # Python dependencies
```

### 2. Django App Architecture

Each Django app follows the **Clean Architecture** pattern:

```
┌─────────────────────────────────────────────────────┐
│                  Views Layer                        │
│  • HTTP Request/Response handling                    │
│  • Permission checking                              │
│  • Request validation                               │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│               Serializer Layer                      │
│  • Input validation                                 │
│  • Data transformation                               │
│  • Output formatting                                │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│                Service Layer                        │
│  • Business logic                                   │
│  • Transaction management                           │
│  • Domain rules enforcement                         │
│  • Error handling                                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│               Selector Layer                        │
│  • Data access patterns                             │
│  • Query optimization                                │
│  • Query building                                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│               Model Layer                           │
│  • Database schema                                  │
│  • ORM models                                       │
│  • Relationships                                     │
└─────────────────────────────────────────────────────┘
```

### 3. Key Design Patterns

#### 1. **Service Layer Pattern**
All business logic is isolated in service classes:

```python
# Example: CreateProductService
class CreateProductService:
    @staticmethod
    @transaction.atomic
    def execute(*args, **kwargs) -> Product:
        # Business logic here
        pass
```

**Benefits**:
- Business logic is testable
- Reusable across views and serializers
- Transaction boundary management
- Easy to mock for testing

#### 2. **Selector Pattern**
Selectors encapsulate data access logic:

```python
# Example: ProductSelector
class ProductSelector:
    @staticmethod
    def get_active_products():
        return Product.objects.filter(status=ProductStatus.ACTIVE)

    @staticmethod
    def search_products(query: str):
        return Product.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )
```

**Benefits**:
- Separates data access from business logic
- Centralizes query optimization
- Easy to test and mock

#### 3. **Enum-based Status Management**
Statuses are defined as enums:

```python
# apps/common/enums/order_status.py
class OrderStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    DELIVERING = "delivering"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
```

**Benefits**:
- Type safety
- IDE autocomplete
- Easy to validate
- Self-documenting

#### 4. **Permission-based Access Control**
Fine-grained permissions using DRF permissions:

```python
# apps/common/permissions/store.py
class IsStoreOwner(Permission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user
```

#### 5. **Pagination Pattern**
Standardized pagination across API:

```python
# Pagination
PAGE_SIZE = 20

# Usage
self.paginate_queryset(queryset, request)
```

## Frontend Architecture

### 1. Project Structure

```
frontend/
├── src/
│   ├── pages/                 # Page components
│   │   ├── HomePage.tsx
│   │   ├── ProductListPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── OrderDetailPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── SearchPage.tsx
│   │   └── ProfilePage.tsx
│   │
│   ├── components/            # Reusable UI components
│   │   ├── ProductCard.tsx
│   │   ├── CategoryCard.tsx
│   │   ├── StoreCard.tsx
│   │   ├── CartItemRow.tsx
│   │   ├── OrderCard.tsx
│   │   └── (others)
│   │
│   ├── features/              # Feature modules (to be implemented)
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── stores/
│   │   └── (others)
│   │
│   ├── hooks/                 # Custom React hooks (to be implemented)
│   │   ├── useCart/
│   │   ├── useOrders/
│   │   ├── useProducts/
│   │   └── (others)
│   │
│   ├── services/              # API services
│   │   └── api.ts             # Axios instance
│   │
│   ├── stores/                # Zustand state management
│   │   ├── authStore.ts       # Authentication state
│   │   ├── appStore.ts        # App state
│   │   ├── uiStore.ts         # UI state
│   │   └── telegramStore.ts   # Telegram state
│   │
│   ├── routes/                # Routing configuration
│   │   ├── routes.tsx         # Route definitions
│   │   ├── paths.ts           # Route path constants
│   │   ├── router.ts          # Router setup
│   │   ├── PageWrapper.tsx    # Page wrapper component
│   │   ├── ProtectedRoute.tsx # Auth protection
│   │   └── SellerRoute.tsx    # Seller protection
│   │
│   ├── types/                 # TypeScript types
│   │   ├── index.ts           # Main type exports
│   │   └── schema.d.ts        # Generated from API spec
│   │
│   ├── utils/                 # Utility functions
│   │   ├── normalizeError.ts  # Error normalization
│   │   ├── orderStatus.ts     # Order status utils
│   │   └── sellerAccess.ts    # Seller access utils
│   │
│   ├── layouts/               # Layout components
│   │   ├── (to be implemented)
│   │
│   └── app/                   # App-level configuration
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
│
├── public/                    # Static assets
├── assets/                    # Custom assets
├── components/ui/             # UI components (to be implemented)
├── constants/                 # App constants
├── test/                      # Test setup
│   └── setup.ts
└── dist/                      # Build output
```

### 2. Frontend Architecture Pattern

#### **Feature-based Architecture** (Planned)

```typescript
// Example: Cart feature structure
features/cart/
├── hooks/
│   └── useCart.ts             # Cart state management
├── components/
│   ├── CartItem.tsx
│   ├── CartSection.tsx
│   └── CartSummary.tsx
├── pages/
│   └── CartPage.tsx           # (already exists, needs refactoring)
├── services/
│   └── cartService.ts         # API calls to backend
└── types/
    └── cartTypes.ts
```

### 3. State Management (Zustand)

#### **Auth Store**
```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  clearUser: () => void
  updateUser: (user: User) => void
}
```

#### **App Store**
```typescript
interface AppState {
  isLoading: boolean
  error: string | null
  showSidebar: boolean
  showMobileMenu: boolean
  // App-level state
}
```

#### **UI Store**
```typescript
interface UIState {
  theme: 'light' | 'dark'
  notifications: Notification[]
  // UI state
}
```

### 4. Data Fetching (TanStack Query)

#### **Example: Product Fetching**
```typescript
// Example query hook (to be implemented)
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### 5. Routing Architecture

#### **Route Structure**
```typescript
// Public routes
/ → HomePage
/search → SearchPage
/catalog/:categorySlug → CategoryPage
/stores → StoreListPage
/store/:storeId → StoreDetailPage
/product/:productId → ProductDetailPage
/login → LoginPage
/register → RegisterPage

// Protected routes
/cart → CartPage
/checkout/:storeId → CheckoutPage
/orders → OrdersPage
/order/:orderId → OrderDetailPage
/profile → ProfilePage

// Seller routes
/seller → SellerDashboard
/seller/products → SellerProducts
/seller/orders → SellerOrders
/seller/settings → SellerSettings
```

#### **Route Guards**
```typescript
// ProtectedRoute - requires authentication
// SellerRoute - requires seller role
```

## Data Flow

### User Authentication Flow

```
1. User enters phone number
   ↓
2. Frontend sends POST /api/v1/auth/register
   ↓
3. Backend creates inactive user
   ↓
4. Backend returns verification link (Telegram)
   ↓
5. User clicks link (opens in Telegram)
   ↓
6. Backend verifies Telegram account
   ↓
7. Backend links Telegram and activates user
   ↓
8. Backend returns access/refresh tokens
   ↓
9. Frontend stores tokens in authStore
   ↓
10. Frontend sets JWT interceptor
```

### Product Listing Flow

```
1. User navigates to product list
   ↓
2. Frontend calls GET /api/v1/products?category=1
   ↓
3. Backend queries ProductSelector.get_products_by_category(1)
   ↓
4. Backend returns paginated ProductListSerializer
   ↓
5. Frontend receives data in TanStack Query cache
   ↓
6. Frontend renders ProductCard components
```

### Cart Flow

```
1. User clicks "Add to Cart" on product
   ↓
2. Frontend calls POST /api/v1/cart/items
   ↓
3. Backend creates or updates CartItem
   ↓
4. Backend returns updated Cart
   ↓
5. Frontend updates cartStore or TanStack Query cache
   ↓
6. Frontend updates CartPage UI
```

## Communication Patterns

### Backend-to-Frontend

1. **REST API** - Primary communication
2. **WebSocket** - Planned for real-time notifications
3. **Telegram Bot** - User verification and notifications

### Service Layer Communication

- **Services call Selectors** - Business logic calls data access
- **Services call Models** - Database operations via ORM
- **Serializers validate Services** - Input validation
- **Views orchestrate Services** - HTTP handling

### Frontend Data Flow

```
Component → Hook → Service → API → Response
   ↓
Update State (Zustand or Query)
   ↓
Re-render Component
```

## Security Architecture

### 1. Authentication
- JWT access tokens (30 min expiry)
- JWT refresh tokens (7 day expiry)
- Secure token storage in localStorage

### 2. Authorization
- Role-based permissions
- Object-level permissions (store owner, product owner)
- Permission decorators on views

### 3. Data Security
- Password hashing (Django default)
- CSRF protection (Django)
- HTTPS enforcement
- SQL injection prevention (ORM)
- XSS prevention (React auto-escaping)

### 4. API Security
- API authentication via JWT
- API rate limiting (planned)
- Input validation (serializers)
- Error message sanitization

## Performance Architecture

### Backend Optimization

1. **Database Optimization**
   - Database indexes
   - Query optimization via selectors
   - Select related prefetching
   - Database connection pooling

2. **Caching**
   - Django cache framework
   - API response caching
   - Static files caching

3. **Database Indexes**
   - Product search indexes
   - User lookup indexes
   - Order status indexes

### Frontend Optimization

1. **Code Splitting**
   - Route-based code splitting
   - Lazy loading components

2. **Bundle Optimization**
   - Tree shaking
   - Minification
   - Compression

3. **Image Optimization**
   - Lazy loading
   - Responsive images
   - WebP format

## Deployment Architecture

### Development Environment
- Docker Compose for local development
- Hot reload for both backend and frontend
- Postgres database via Docker
- Separate processes for backend and frontend

### Production Environment (Planned)
- Nginx reverse proxy
- Gunicorn for backend
- Vite production build
- CDN for static assets
- Load balancing (planned)

---

**Last Updated**: August 28, 2026
**Version**: 1.0.0
