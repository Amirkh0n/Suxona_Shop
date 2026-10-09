# SuxonaShop Project Overview

## What is SuxonaShop?

SuxonaShop is a comprehensive multi-vendor marketplace platform built to connect buyers and sellers in Uzbekistan. It enables users to browse products from various stores, create shopping carts, place orders, and track order status.

## Primary Purpose

The primary goal of SuxonaShop is to provide a seamless e-commerce experience where:
- **Buyers** can discover products across multiple stores
- **Sellers** can list and manage their products
- **Administrators** can manage stores, banners, and platform settings

## Core Features

### 1. User Roles
- **Customer** - Regular users who browse products and place orders
- **Seller** - Store owners who manage products and orders
- **Admin** - Platform administrators who manage stores, banners, and content

### 2. Main Business Processes

#### User Journey for Customers
1. **Registration & Verification** → Phone + Telegram verification
2. **Product Discovery** → Browse categories, search, filter products
3. **Product Viewing** → View product details, images, store info
4. **Shopping** → Add products to cart, manage cart items
5. **Checkout** → Select delivery address, review order
6. **Order Placement** → Confirm order, receive order confirmation
7. **Order Tracking** → Monitor order status (pending, confirmed, delivering, completed, cancelled)

#### Seller Journey
1. **Store Application** → Apply to open a store
2. **Store Management** → Manage store details, delivery zones
3. **Product Management** → Create, update, delete products
4. **Order Management** → Accept, reject, complete, cancel orders
5. **Statistics** → View sales performance

### 3. Key Functionalities

#### Product Features
- **Categories** → Hierarchical product organization with icons
- **Products** → Multiple images, pricing, stock management, status (draft/active/inactive)
- **Search** → Search by name, description, category
- **Filtering** → Filter by category, store, price range
- **Sorting** → Sort by price, name, newest, popularity

#### Cart Features
- **Cart Management** → Add/remove/update quantities
- **Store-based Cart** → Cart grouped by store (multi-store support)
- **Delivery Calculation** → Automatic delivery cost based on delivery zone

#### Order Features
- **Order Creation** → From cart to order with address
- **Order Status Tracking** → Multiple status states
- **Order Management** → Customer can cancel, seller can manage

#### Store Features
- **Store Listings** → Browse stores by location
- **Store Details** → Store info, ratings, product count
- **Delivery Zones** → Store-defined delivery areas with costs
- **Store Applications** → Application approval workflow

#### Authentication
- **Phone-based Registration** → No password initially
- **Telegram Verification** → Account activation via Telegram bot
- **JWT Tokens** → Access and refresh tokens for API authentication

#### Admin Features
- **Store Management** → Approve/reject store applications
- **Banner Management** → Create promotional banners
- **Content Management** → Manage products, categories, stores

## Target Audience

- **Uzbekistan Users** - Primary market with local language support (Uzbek, Russian)
- **Small Business Owners** - Vendors selling products online
- **General Consumers** - People looking to buy products online

## Platform Scope

SuxonaShop is a **multi-vendor marketplace** where:
- Multiple stores can operate independently
- Products from different stores are displayed in one catalog
- Each store manages its own products and orders
- Delivery zones are store-specific
- Cart can contain products from multiple stores

## Technical Architecture

### Backend Technology Stack
- **Language**: Python 3
- **Framework**: Django 5.2
- **API Framework**: Django REST Framework 3.17
- **ORM**: Django ORM
- **Database**: PostgreSQL 16
- **Authentication**: JWT (SimpleJWT)
- **Documentation**: DRF Spectacular (OpenAPI 3.0)
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Telegram Bot**: For account verification and notifications

### Frontend Technology Stack
- **Framework**: React 19
- **Routing**: React Router 7
- **Build Tool**: Vite 8
- **State Management**: Zustand 5
- **Data Fetching**: TanStack React Query 5
- **Forms**: React Hook Form 7 + Zod 4
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest
- **TypeScript**: Fully typed
- **HTTP Client**: Axios

### Development Tools
- **Docker** → Containerization
- **Docker Compose** → Multi-service orchestration
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript
- **Testing**: Vitest, pytest

## Deployment Architecture

### Current Setup
- **Backend**: Django with Gunicorn on port 8000
- **Database**: PostgreSQL 16-alpine
- **File Storage**: Cloudflare R2
- **Frontend**: Vite dev server (to be configured)

### Environment Configuration
- Local development with .env files
- Production-ready with separate settings
- Database migrations
- Static/media file handling

## Key Business Rules

1. **Store Activation** → Stores must be approved to list products
2. **Product Status** → Products start as DRAFT, must be ACTIVE to appear in search
3. **Telegram Verification** → All accounts require Telegram verification
4. **Multi-store Cart** → Cart items grouped by store, separate delivery costs
5. **Order Status Flow** → PENDING → CONFIRMED → DELIVERING → COMPLETED
6. **Stock Management** → Products can have stock tracking
7. **Delivery Zones** → Store-specific delivery areas with pricing

## Current Development Phase

**Phase**: MVP (Minimum Viable Product)

### Completed
- ✅ Backend API with all CRUD operations
- ✅ Authentication system (Telegram verification)
- ✅ Product management (categories, products, images)
- ✅ Store management (stores, delivery zones, applications)
- ✅ Order management (cart, orders, order items)
- ✅ Banner management
- ✅ Telegram bot integration
- ✅ API documentation (OpenAPI/Swagger)

### In Progress
- 🔄 Frontend UI completion
- 🔄 Frontend API integration
- 🔄 State management implementation
- 🔄 Form validation and error handling

### Planned
- ⏳ Seller dashboard
- ⏳ Customer dashboard
- ⏳ Payment integration
- ⏳ Order tracking notifications
- ⏳ Admin panel
- ⏳ Performance optimization
- ⏳ SEO optimization

## Success Metrics

1. **User Acquisition** - Number of registered users
2. **Store Participation** - Number of active stores
3. **Transaction Volume** - Total order value
4. **Customer Satisfaction** - Order completion rate
5. **Platform Activity** - Daily active users, orders placed

## Future Roadmap

### Short Term (3-6 months)
- Complete frontend implementation
- Launch MVP to limited user base
- Gather feedback and iterate
- Add payment gateway integration

### Medium Term (6-12 months)
- Expand to more cities in Uzbekistan
- Add product categories
- Implement ratings and reviews
- Seller analytics dashboard

### Long Term (12+ months)
- Mobile app development
- Advanced search features
- AI-powered recommendations
- Multi-language support
- Global expansion

---

**Last Updated**: August 28, 2026
**Version**: 1.0.0
