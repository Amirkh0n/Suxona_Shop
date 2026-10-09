# SuxonaShop Known Issues & Technical Debt

## Current Issues

### High Priority Issues

#### 1. Frontend Using Mock Data Instead of Real API ⚠️

**Severity**: HIGH
**Status**: In Progress
**Priority**: P0

**Description**:
- All frontend pages are using mock data
- No real API integration
- Cannot test with actual backend

**Affected Files**:
- `src/pages/HomePage.tsx` (lines 40-154)
- `src/pages/CartPage.tsx` (lines 31-310)
- `src/pages/ProductListPage.tsx`
- All other pages with mock data

**Impact**:
- Cannot test real functionality
- Integration testing not possible
- Deployment will fail

**Fix Required**:
1. Create service layer (`src/services/`)
2. Create feature modules (`src/features/`)
3. Create custom hooks (`src/hooks/`)
4. Replace mock data with API calls
5. Implement error handling
6. Implement loading states

**Estimated Effort**: 3-4 weeks

---

#### 2. Missing Service Layer ⚠️

**Severity**: HIGH
**Status**: Not Started
**Priority**: P0

**Description**:
- No service layer to handle API calls
- No business logic abstraction
- Components directly calling API

**Current Structure**:
```
Component → Direct API Call (missing)
```

**Required Structure**:
```
Component → Hook → Service → API
```

**Files to Create**:
```
src/services/
├── auth.service.ts
├── products.service.ts
├── cart.service.ts
├── orders.service.ts
├── stores.service.ts
├── addresses.service.ts
└── verification.service.ts
```

**Estimated Effort**: 1-2 weeks

---

#### 3. Missing Feature Modules ⚠️

**Severity**: HIGH
**Status**: Not Started
**Priority**: P0

**Description**:
- No feature-based organization
- Business logic not isolated
- Hard to maintain

**Current Structure**:
```
src/
├── pages/
├── components/
└── services/
```

**Required Structure**:
```
src/
├── pages/
├── components/
├── features/
│   ├── cart/
│   ├── orders/
│   ├── products/
│   └── stores/
├── hooks/
└── services/
```

**Files to Create**:
```
src/features/
├── cart/
│   ├── hooks/
│   │   └── useCart.ts
│   ├── components/
│   └── types/
├── orders/
│   ├── hooks/
│   ├── components/
│   └── types/
├── products/
│   ├── hooks/
│   └── components/
└── stores/
    └── hooks/
```

**Estimated Effort**: 2-3 weeks

---

#### 4. Missing Custom Hooks ⚠️

**Severity**: HIGH
**Status**: Not Started
**Priority**: P0

**Description**:
- No custom hooks for data fetching
- Business logic duplicated across components
- Hard to test

**Required Hooks**:
```
src/hooks/
├── useAuth.ts
├── useCart.ts
├── useOrders.ts
├── useProducts.ts
├── useStoreList.ts
└── useAddressList.ts
```

**Estimated Effort**: 1 week

---

### Medium Priority Issues

#### 5. Incomplete UI Component Library ⚠️

**Severity**: MEDIUM
**Status**: Not Started
**Priority**: P1

**Description**:
- No reusable UI components
- Components duplicated
- Inconsistent styling

**Missing Components**:
- Button
- Input
- Card
- Modal
- Toast
- Skeleton
- Empty state
- Error state
- Badge

**Files to Create**:
```
src/components/ui/
├── Button.tsx
├── Input.tsx
├── Card.tsx
├── Modal.tsx
├── Toast.tsx
├── Skeleton.tsx
├── EmptyState.tsx
├── ErrorState.tsx
└── Badge.tsx
```

**Estimated Effort**: 1 week

---

#### 6. No Error Handling Infrastructure ⚠️

**Severity**: MEDIUM
**Status**: Not Started
**Priority**: P1

**Description**:
- No centralized error handling
- Errors not caught consistently
- Users don't see meaningful errors

**Missing**:
- Error boundary
- Error normalization
- Error logging
- Error display components

**Files to Create**:
```
src/components/ErrorBoundary.tsx
src/components/ErrorMessage.tsx
src/utils/normalizeError.ts (exists but incomplete)
```

**Estimated Effort**: 1 week

---

#### 7. No Loading States ⚠️

**Severity**: MEDIUM
**Status**: Not Started
**Priority**: P0

**Description**:
- No skeleton loaders
- No loading spinners
- Users don't know when data is loading

**Missing**:
- Skeleton for all pages
- Skeleton for all components
- Loading states for API calls
- Loading states for transitions

**Files to Create**:
```
src/components/ui/Skeleton.tsx
```

**Estimated Effort**: 1 week

---

#### 8. No Empty States ⚠️

**Severity**: MEDIUM
**Status**: Not Started
**Priority**: P1

**Description**:
- No empty state components
- Users see blank pages when no data
- No call-to-action for empty states

**Missing**:
- Empty state for cart
- Empty state for orders
- Empty state for products
- Empty state for stores
- Empty state for addresses

**Files to Create**:
```
src/components/EmptyState.tsx
```

**Estimated Effort**: 3-4 days

---

#### 9. Missing Seller Features ⚠️

**Severity**: MEDIUM
**Status**: Not Started
**Priority**: P2

**Description**:
- No seller dashboard
- No seller route protection
- No seller permissions

**Missing**:
- Seller dashboard page
- Seller orders management
- Seller products management
- Seller store settings
- Seller route guards

**Estimated Effort**: 2 weeks

---

### Low Priority Issues

#### 10. No Testing Infrastructure ⚠️

**Severity**: MEDIUM
**Status**: Not Started
**Priority**: P1

**Description**:
- No unit tests
- No integration tests
- No E2E tests

**Required**:
- Unit tests for services
- Unit tests for hooks
- Integration tests for critical flows
- E2E tests for main user journeys

**Estimated Effort**: 2-3 weeks

---

#### 11. No Performance Optimization ⚠️

**Severity**: LOW
**Status**: Not Started
**Priority**: P2

**Description**:
- No code splitting
- No lazy loading
- Large bundle size
- No image optimization

**Required**:
- Route-based code splitting
- Lazy loading for components
- Image optimization
- Bundle size reduction

**Estimated Effort**: 1 week

---

#### 12. Incomplete Documentation ⚠️

**Severity**: LOW
**Status**: COMPLETED
**Priority**: P2

**Description**:
- Documentation was incomplete
- Now all major documentation is complete

**Completed**:
- ✅ PROJECT_OVERVIEW.md
- ✅ ARCHITECTURE.md
- ✅ API.md
- ✅ DATABASE.md
- ✅ USER_FLOWS.md
- ✅ IMPLEMENTATION_PLAN.md

---

## Technical Debt

### 1. Hardcoded Values ⚠️

**Severity**: MEDIUM
**Status**: Started

**Issues**:
- URLs hardcoded in components
- Feature flags not implemented
- Mock data in production code

**Examples**:
- `src/pages/HomePage.tsx`: Mock banner images
- `src/pages/CartPage.tsx`: Mock cart data
- No use of environment variables

**Fix Required**:
- Move all URLs to constants
- Use environment variables
- Remove all mock data

**Estimated Effort**: 1 week

---

### 2. Missing TypeScript Types ⚠️

**Severity**: MEDIUM
**Status**: Started

**Issues**:
- Some components use `any` types
- Incomplete type definitions
- Missing types for API responses

**Examples**:
- Some components use `any` for props
- API types need to be updated
- Missing types for services

**Fix Required**:
- Remove all `any` types
- Add missing type definitions
- Update API type definitions

**Estimated Effort**: 1 week

---

### 3. No Component Documentation ⚠️

**Severity**: LOW
**Status**: Not Started

**Issues**:
- No JSDoc comments on components
- No component usage examples
- No prop type documentation

**Fix Required**:
- Add JSDoc comments to all components
- Add prop type documentation
- Add usage examples

**Estimated Effort**: 1 week

---

### 4. Inconsistent Code Style ⚠️

**Severity**: LOW
**Status**: Started

**Issues**:
- Different import styles
- Inconsistent naming conventions
- Different spacing/padding styles

**Examples**:
- Some files use `import { x }` instead of `import x`
- Inconsistent file naming (camelCase vs kebab-case)
- Inconsistent spacing

**Fix Required**:
- Run prettier to fix formatting
- Add eslint rules for consistency
- Run linter to fix issues

**Estimated Effort**: 3-4 days

---

### 5. Missing Error Logging ⚠️

**Severity**: MEDIUM
**Status**: Not Started

**Issues**:
- No error logging
- Hard to debug issues
- No error monitoring

**Fix Required**:
- Implement error logging
- Integrate error tracking (Sentry, LogRocket)
- Create error boundary

**Estimated Effort**: 3-4 days

---

## Architecture Issues

### 1. Backend Architecture is Good ✅

**Severity**: NONE
**Status**: Good

**Description**:
- Service layer pattern implemented
- Selector pattern implemented
- Clean architecture
- Well-organized code

**Conclusion**: No changes needed

---

### 2. Frontend Architecture Needs Refactoring ⚠️

**Severity**: MEDIUM
**Status**: Needs Refactoring

**Current Issues**:
- Not following feature-based architecture
- No service layer
- No custom hooks
- Components too large

**Required Changes**:
- Adopt feature-based architecture
- Implement service layer
- Create custom hooks
- Break down components

**Estimated Effort**: 3-4 weeks

---

## Known Limitations

### 1. Payment Integration Not Implemented ⚠️

**Severity**: HIGH
**Status**: Not Started
**Priority**: P0

**Description**:
- No payment gateway integration
- Cannot process payments
- Order creation is manual

**Required**:
- Integrate payment gateway (Stripe, Payme, Click)
- Implement payment flow
- Handle payment callbacks
- Implement refunds

**Estimated Effort**: 2 weeks

---

### 2. Telegram Bot Not Implemented ⚠️

**Severity**: HIGH
**Status**: Not Started
**Priority**: P0

**Description**:
- Telegram bot backend exists but not connected
- Cannot verify users via Telegram
- No Telegram notifications

**Required**:
- Connect Telegram bot to backend
- Implement verification flow
- Implement notification system

**Estimated Effort**: 1 week

---

### 3. Order Tracking Not Implemented ⚠️

**Severity**: MEDIUM
**Status**: Not Started
**Priority**: P1

**Description**:
- No real-time order tracking
- No push notifications for order updates
- Customer cannot track order status

**Required**:
- Implement WebSockets for real-time updates
- Implement push notifications
- Add order tracking page

**Estimated Effort**: 2 weeks

---

### 4. Image Upload Not Optimized ⚠️

**Severity**: LOW
**Status**: Not Started
**Priority**: P2

**Description**:
- Images not optimized before upload
- No image resizing
- No format conversion

**Required**:
- Implement image optimization
- Implement image resizing
- Implement format conversion (WebP)

**Estimated Effort**: 3-4 days

---

### 5. Search Not Optimized ⚠️

**Severity**: LOW
**Status**: Not Started
**Priority**: P2

**Description**:
- No full-text search
- No fuzzy search
- No search history
- No search suggestions

**Required**:
- Implement full-text search
- Implement fuzzy search
- Add search suggestions

**Estimated Effort**: 1 week

---

## Security Issues

### 1. Frontend Token Storage ⚠️

**Severity**: MEDIUM
**Status**: Started

**Current Approach**:
```typescript
localStorage.setItem('accessToken', token)
localStorage.setItem('refreshToken', refreshToken)
```

**Issues**:
- Tokens stored in localStorage (XSS vulnerability)
- Tokens can be accessed by any JS code

**Better Approach**:
```typescript
httpOnly cookies for tokens
```

**Estimated Effort**: 1-2 weeks

---

### 2. No CSRF Protection on Frontend ⚠️

**Severity**: MEDIUM
**Status**: Not Started

**Description**:
- No CSRF tokens for POST requests
- Potential for CSRF attacks

**Fix Required**:
- Implement CSRF tokens
- Add CSRF middleware
- Send tokens with requests

**Estimated Effort**: 3-4 days

---

### 3. Input Validation Not Consistent ⚠️

**Severity**: LOW
**Status**: Not Started

**Description**:
- Different validation approaches
- Some validation on frontend, some on backend
- Validation not consistent

**Fix Required**:
- Standardize validation approach
- Use zod schemas for frontend validation
- Use Django serializers for backend validation

**Estimated Effort**: 3-4 days

---

## Performance Issues

### 1. Large Initial Bundle ⚠️

**Severity**: MEDIUM
**Status**: Not Started
**Priority**: P2

**Current Size**: ~500KB (estimated)
**Target Size**: < 200KB

**Issues**:
- No code splitting
- No tree shaking
- All dependencies bundled

**Fix Required**:
- Implement route-based code splitting
- Lazy load components
- Optimize dependencies

**Estimated Effort**: 1 week

---

### 2. No Caching Strategy ⚠️

**Severity**: MEDIUM
**Status**: Not Started
**Priority**: P1

**Description**:
- No caching for API responses
- No caching for static assets
- All requests fetch new data

**Fix Required**:
- Implement TanStack Query caching
- Implement browser caching
- Implement server caching

**Estimated Effort**: 1 week

---

### 3. Image Optimization ⚠️

**Severity**: MEDIUM
**Status**: Not Started
**Priority**: P2

**Description**:
- Images not optimized
- No lazy loading
- Large images causing slow page loads

**Fix Required**:
- Implement image optimization
- Implement lazy loading
- Use WebP format
- Implement responsive images

**Estimated Effort**: 3-4 days

---

## Deployment Issues

### 1. No CI/CD Pipeline ⚠️

**Severity**: MEDIUM
**Status**: Not Started
**Priority**: P2

**Description**:
- No automated testing
- No automated deployment
- Manual deployment process

**Fix Required**:
- Set up GitHub Actions or GitLab CI
- Implement automated tests
- Implement automated deployment

**Estimated Effort**: 1-2 weeks

---

### 2. No Environment Management ⚠️

**Severity**: MEDIUM
**Status**: Not Started
**Priority**: P0

**Description**:
- Environment variables not managed
- No environment-specific configurations
- Hardcoded environment-specific values

**Fix Required**:
- Use .env files
- Use different environments (dev, staging, prod)
- Implement environment switching

**Estimated Effort**: 3-4 days

---

## Future Enhancements

### 1. Multi-language Support ⏳

**Status**: Not Started
**Priority**: P3

**Description**:
- Currently only Uzbek language
- Need Russian and English support

**Estimated Effort**: 2 weeks

---

### 2. Order Tracking Notifications ⏳

**Status**: Not Started
**Priority**: P3

**Description**:
- No push notifications for order updates
- Users must check manually

**Estimated Effort**: 1 week

---

### 3. Product Reviews & Ratings ⏳

**Status**: Not Started
**Priority**: P3

**Description**:
- No product reviews
- No star ratings
- No user feedback

**Estimated Effort**: 1-2 weeks

---

### 4. Wishlist Feature ⏳

**Status**: Not Started
**Priority**: P3

**Description**:
- No wishlist functionality
- Users cannot save products for later

**Estimated Effort**: 1 week

---

### 5. Advanced Search ⏳

**Status**: Not Started
**Priority**: P3

**Description**:
- No full-text search
- No search filters
- No search suggestions

**Estimated Effort**: 1 week

---

## Summary

### Issues by Priority

**P0 - Blocking**:
1. Frontend using mock data instead of real API
2. Missing service layer
3. Missing feature modules
4. Missing custom hooks

**P1 - Main Features**:
5. Incomplete UI component library
6. No error handling infrastructure
7. No loading states
8. No empty states
9. No testing infrastructure

**P2 - Polish**:
10. Missing seller features
11. No performance optimization
12. Hardcoded values
13. Missing TypeScript types

**P3 - Future**:
14. Order tracking not implemented
15. Image upload not optimized
16. Search not optimized
17. No CI/CD pipeline
18. No environment management

---

### Total Estimated Effort

**P0 Issues**: 8-10 weeks
**P1 Issues**: 4-5 weeks
**P2 Issues**: 3-4 weeks
**P3 Enhancements**: 4-5 weeks

**Total**: 19-24 weeks (5-6 months)

---

**Last Updated**: August 28, 2026
**Status**: Issues documented, Implementation started
