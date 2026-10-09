# SuxonaShop User Flows

## Authentication Flows

### 1. New User Registration (Phone)

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User enters registration page                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: User fills registration form                    │
│   - Phone number (required)                             │
│   - First name (required)                               │
│   - Last name (optional)                                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: User submits form                               │
│   POST /api/v1/auth/register                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Backend creates inactive user account           │
│   - Checks if phone already exists                       │
│   - Creates user with is_active=False                    │
│   - Generates verification token                         │
│   - Creates verification record                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Backend returns response                        │
│   {                                                      │
│     id, phone, first_name, last_name,                   │
│     telegram_account: null,                              │
│     verification_token: "abc123xyz",                     │
│     verification_link: "https://t.me/..."               │
│   }                                                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: User opens verification link in Telegram         │
│   - Clicks "Start" or opens bot                         │
│   - Bot receives start command with token               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 7: Backend validates and links Telegram            │
│   POST /api/v1/auth/telegram/verify                     │
│   Body: { verification_token, telegram_id }             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 8: Backend performs validation                    │
│   - Checks if token exists and is valid                 │
│   - Checks if token not already used                     │
│   - Checks if Telegram ID already linked                 │
│   - If valid:                                             │
│     * Links Telegram account                             │
│     * Activates user account                             │
│     * Returns tokens                                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 9: User redirected to home                         │
│   - Frontend stores tokens in localStorage              │
│   - Frontend updates authStore                          │
│   - User can now browse products                         │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/telegram/verify`

**State Transitions**:
- User: `inactive` → `active`

---

### 2. User Login

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User enters login page                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: User fills login form                           │
│   - Phone number (required)                             │
│   - Password (required)                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: User submits form                               │
│   POST /api/v1/auth/login                                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Backend authenticates user                     │
│   - Validates credentials                               │
│   - Checks if user is active                             │
│   - Generates access and refresh tokens                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Backend returns tokens                          │
│   {                                                      │
│     access: "eyJ0eXAi...",                               │
│     refresh: "eyJ0eXAi..."                               │
│   }                                                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Frontend stores tokens                          │
│   - Saves access token to localStorage                  │
│   - Saves refresh token to localStorage                 │
│   - Updates authStore                                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 7: User redirected to home                         │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `POST /api/v1/auth/login`

**Error Scenarios**:
- Invalid credentials: 401 Unauthorized
- Account inactive: 403 Forbidden
- Account not verified: 403 Forbidden

---

### 3. Token Refresh

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Access token expires                            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Frontend detects expired token                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Frontend calls refresh endpoint                 │
│   POST /api/v1/auth/login                                │
│   Body: { refresh: "..." }                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Backend validates refresh token                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Backend generates new access token              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Backend returns new tokens                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 7: Frontend updates tokens                         │
│   - Replaces old access token                            │
│   - Refreshes access token timer                         │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `POST /api/v1/auth/login`

**Error Scenarios**:
- Invalid refresh token: 401 Unauthorized
- Refresh token expired: 401 Unauthorized

---

## Product Discovery Flow

### 1. Browse Categories

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User lands on home page                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: User sees category grid                         │
│   - Categories: Ovqat, Kiyim, Elektronika, etc.          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: User clicks on a category                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: User navigates to category page                 │
│   GET /api/v1/products?category=1                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Backend returns products in category            │
│   - Paginated list of products                           │
│   - Product details (image, name, price)                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: User sees product list                          │
│   - Product cards displayed                             │
│   - Filter/sort options available                        │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `GET /api/v1/products?category={category_id}`

**State Transitions**:
- Current page: home → category

---

### 2. Search Products

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User sees search bar on home page               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: User types search query                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: User clicks search button or presses Enter      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: User navigates to search page                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: User sees search results                        │
│   GET /api/v1/products?search=keywords                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Backend searches products                       │
│   - Searches by name                                    │
│   - Searches by description                             │
│   - Returns matching products                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 7: User sees search results                        │
│   - Product cards with matches                          │
│   - Can filter by category, store                        │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `GET /api/v1/products?search={query}`
- `GET /api/v1/products?search={query}&category={id}`
- `GET /api/v1/products?search={query}&store={id}`

**State Transitions**:
- Current page: home → search

---

### 3. View Product Detail

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User clicks on a product card                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: User navigates to product page                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: User sees product page                           │
│   - Product images (carousel)                            │
│   - Product name, description                           │
│   - Price, stock                                        │
│   - Store info                                          │
│   - Add to cart button                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: User reviews product details                    │
│   - Check price                                         │
│   - Check availability                                  │
│   - Read description                                    │
│   - View store reviews                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: User adds product to cart                       │
│   - Clicks "Add to Cart" button                         │
│   - Or enters quantity                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Product added to cart                          │
│   - Cart updated in backend                            │
│   - User sees confirmation toast                         │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `GET /api/v1/products/{product_id}`

**State Transitions**:
- Current page: product list → product detail

---

## Shopping Flow

### 1. View Cart

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User clicks cart icon                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: User navigates to cart page                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Backend returns cart data                       │
│   GET /api/v1/cart                                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: User sees cart contents                         │
│   - Grouped by store                                    │
│   - Store name, logo                                    │
│   - Items with quantities                               │
│   - Store subtotal, delivery cost                       │
│   - Cart total                                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: User can:                                       │
│   - Add more items to cart                              │
│   - Update quantities                                   │
│   - Remove items                                        │
│   - Proceed to checkout                                 │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PATCH /api/v1/cart/items/{item_id}`
- `DELETE /api/v1/cart/items/{item_id}`

**State Transitions**:
- Current page: product detail → cart

---

### 2. Update Cart Quantity

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User sees cart page                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: User clicks increase/decrease quantity button   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Frontend updates local quantity                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Frontend sends update request                  │
│   PATCH /api/v1/cart/items/{item_id}                    │
│   Body: { quantity: new_quantity }                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Backend updates cart item                       │
│   - Validates new quantity                              │
│   - Recalculates subtotal                               │
│   - Returns updated cart item                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Frontend updates cart page                      │
│   - Refreshes cart data                                 │
│   - Updates totals                                       │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `PATCH /api/v1/cart/items/{item_id}`

---

### 3. Remove Cart Item

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User sees cart page                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: User clicks remove item button                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Frontend sends remove request                  │
│   DELETE /api/v1/cart/items/{item_id}                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Backend removes cart item                       │
│   - Deletes cart item                                    │
│   - Returns 204 No Content                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Frontend updates cart page                      │
│   - Refreshes cart data                                 │
│   - If cart empty: redirect to products                 │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `DELETE /api/v1/cart/items/{item_id}`

---

### 4. Clear Cart

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User clicks "Clear Cart" button                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Frontend sends clear request                   │
│   DELETE /api/v1/cart                                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Backend clears cart                             │
│   - Deletes all cart items                              │
│   - Returns 204 No Content                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Frontend updates cart page                      │
│   - Shows empty cart state                               │
│   - Redirects to products                                │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `DELETE /api/v1/cart`

---

### 5. Checkout Process

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User clicks "Checkout" on cart page             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: User chooses store to checkout                 │
│   - If multiple stores: show checkout per store          │
│   - User selects store                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: User navigates to checkout page                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: User selects delivery address                  │
│   - Shows saved addresses                               │
│   - User selects or creates new address                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: User reviews order summary                     │
│   - Store name                                          │
│   - Items with quantities                               │
│   - Subtotal                                            │
│   - Delivery cost                                       │
│   - Total                                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: User adds order note (optional)                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 7: User confirms order                            │
│   - Clicks "Place Order" button                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 8: Backend creates order                          │
│   POST /api/v1/orders                                   │
│   Body: { store, address, note }                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 9: Backend validates and creates order             │
│   - Validates cart has items for store                  │
│   - Validates delivery zone                              │
│   - Creates order and order items                       │
│   - Clears cart                                          │
│   - Returns order details                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 10: Backend sends Telegram notification            │
│   - Store owner notified                                 │
│   - Customer receives order confirmation                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 11: User redirected to order success page          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 12: User sees order confirmation                   │
│   - Order ID                                             │
│   - Order summary                                        │
│   - Order status                                        │
│   - "Track Order" button                                 │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `GET /api/v1/cart` (to verify cart)
- `POST /api/v1/orders`

**State Transitions**:
- Current page: cart → checkout → order success

---

### 6. Create Address

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User sees addresses list on checkout            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: User clicks "Add New Address" button           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: User fills address form                         │
│   - Village (required)                                  │
│   - Street (required)                                   │
│   - Home number (required)                              │
│   - Flat number (optional)                              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: User submits form                               │
│   POST /api/v1/addresses                                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Backend creates address                         │
│   - Validates input                                      │
│   - Saves address                                        │
│   - Returns address details                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Frontend updates address list                   │
│   - Adds new address to list                            │
│   - Shows success message                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 7: User selects the new address                   │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `GET /api/v1/addresses`
- `POST /api/v1/addresses`
- `PATCH /api/v1/addresses/{address_id}`
- `DELETE /api/v1/addresses/{address_id}`

---

## Order Management Flow

### 1. View Order History (Customer)

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User clicks "Orders" in navigation              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: User navigates to orders page                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Backend returns user's orders                   │
│   GET /api/v1/orders/my                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: User sees order list                            │
│   - Order cards with summary                            │
│   - Status badges                                       │
│   - Total amount                                         │
│   - Order date                                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: User can view order details                     │
│   - Click order card                                    │
│   - Navigate to order detail page                       │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `GET /api/v1/orders/my`

**State Transitions**:
- Current page: home → orders

---

### 2. View Order Detail (Customer)

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User clicks order card                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: User navigates to order detail page             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Backend returns order details                   │
│   GET /api/v1/orders/{order_id}                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: User sees order details                         │
│   - Order summary                                       │
│   - Items with quantities                               │
│   - Address details                                     │
│   - Status history                                       │
│   - Timeline view                                        │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `GET /api/v1/orders/{order_id}`

**State Transitions**:
- Current page: orders → order detail

---

### 3. Cancel Order (Customer)

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: User sees order detail page                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: User clicks "Cancel Order" button              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Backend validates cancellation                  │
│   - Checks if order can be cancelled                    │
│   - Only pending orders can be cancelled                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Backend cancels order                           │
│   POST /api/v1/orders/{order_id}/cancel                 │
│   - Updates order status                                 │
│   - Records cancellation reason                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Frontend updates order page                     │
│   - Shows cancelled status                              │
│   - Displays cancellation reason                        │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `POST /api/v1/orders/{order_id}/cancel`

**Error Scenarios**:
- Order not cancellable: 409 Conflict
- Not order owner: 403 Forbidden

---

## Seller Flows

### 1. Apply for Store

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Seller logs in with verified account           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Seller navigates to seller dashboard            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Seller clicks "Apply for Store" button         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Seller fills store application form             │
│   - Store name (required)                               │
│   - Description (optional)                              │
│   - Phone (required)                                    │
│   - Telegram username (optional)                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Seller submits application                     │
│   POST /api/v1/store-applications                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Backend creates store application              │
│   - Creates application record                          │
│   - Sets status to "pending"                            │
│   - Returns application details                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 7: Frontend shows success message                  │
│   - Application submitted                                │
│   - Status: pending                                      │
│   - Can check status later                               │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `POST /api/v1/store-applications`

**State Transitions**:
- Application: `pending`

---

### 2. Manage Products (Seller)

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Store approved and seller logged in            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Seller navigates to products management         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Seller clicks "Add Product" button             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Seller fills product form                       │
│   - Category (required)                                 │
│   - Name (required)                                      │
│   - Description (optional)                              │
│   - Price (required)                                    │
│   - Stock (optional)                                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Seller uploads product images                   │
│   - Multiple images supported                           │
│   - Set primary image                                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Seller submits product                         │
│   POST /api/v1/products                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 7: Backend creates product                         │
│   - Creates product in DRAFT status                     │
│   - Uploads images                                       │
│   - Returns product details                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 8: Frontend shows success message                  │
│   - Product created                                      │
│   - Status: draft                                        │
│   - Can edit later                                       │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `POST /api/v1/products`

---

### 3. Manage Orders (Seller)

**User Journey**:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Seller navigates to orders management           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Seller sees order list                          │
│   - Orders from their store                             │
│   - Status indicators                                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Seller clicks order to view details             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Seller sees order details                       │
│   - Customer details                                    │
│   - Order items                                         │
│   - Delivery address                                    │
│   - Order status                                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Seller takes action based on order status      │
│   - PENDING → Accept, Reject                            │
│   - ACCEPTED → Mark Delivering, Complete               │
│   - DELIVERING → Complete                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Seller clicks action button                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 7: Backend updates order status                   │
│   - Validates status transition                         │
│   - Updates order status                                │
│   - Sends notifications to customer                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 8: Frontend updates order page                     │
│   - Shows new status                                     │
│   - Displays status change reason                       │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
- `POST /api/v1/orders/{order_id}/accept`
- `POST /api/v1/orders/{order_id}/reject`
- `POST /api/v1/orders/{order_id}/delivering`
- `POST /api/v1/orders/{order_id}/complete`
- `POST /api/v1/orders/{order_id}/cancel`

---

## Order Status Timeline

### Customer Flow

```
User places order
    ↓
Order Status: PENDING
    ↓
Store accepts order
    ↓
Order Status: CONFIRMED
    ↓
Store marks as delivering
    ↓
Order Status: DELIVERING
    ↓
Store marks as completed
    ↓
Order Status: COMPLETED
```

### Seller Flow

```
Order received (PENDING)
    ↓
Seller accepts (CONFIRMED)
    ↓
Seller marks delivering (DELIVERING)
    ↓
Seller marks completed (COMPLETED)
```

---

## Error Handling Flows

### 1. Unauthorized Access

```
User tries to access protected route
    ↓
Frontend checks auth state
    ↓
User not authenticated
    ↓
Redirect to login page
```

### 2. Cart Empty Error

```
User tries to checkout with empty cart
    ↓
Backend validates cart
    ↓
Cart is empty
    ↓
Return 400 Bad Request
    ↓
Frontend shows error message
    ↓
User redirected to products
```

### 3. Insufficient Stock

```
User adds product with quantity > stock
    ↓
Backend validates quantity
    ↓
Stock is insufficient
    ↓
Return 400 Bad Request
    ↓
Frontend shows error message
    ↓
Frontend adjusts quantity
```

### 4. Payment Required (Planned)

```
User tries to checkout
    ↓
Backend validates order
    ↓
Payment required
    ↓
Redirect to payment gateway
    ↓
After payment success
    ↓
Create order
```

---

**Last Updated**: August 28, 2026
