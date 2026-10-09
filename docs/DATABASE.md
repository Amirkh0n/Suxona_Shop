# SuxonaShop Database Schema

## Database Configuration

- **Database Type**: PostgreSQL 16
- **Charset**: UTF-8
- **Timezone**: Asia/Tashkent
- **ORM**: Django ORM

## Database Structure

```
┌─────────────────────────────────────────────────────────┐
│                      DATABASE                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                   accounts                       │   │
│  │  • User (Custom User Model)                      │   │
│  │  • Address                                        │   │
│  │  • TelegramAccount                                │   │
│  │  • Verification                                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                   products                        │   │
│  │  • Category                                       │   │
│  │  • Product                                        │   │
│  │  • ProductImage                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                   stores                          │   │
│  │  • Store                                         │   │
│  │  • DeliveryZone                                   │   │
│  │  • Village                                        │   │
│  │  • StoreApplication                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                   orders                          │   │
│  │  • Cart                                           │   │
│  │  • CartItem                                       │   │
│  │  • Order                                          │   │
│  │  • OrderItem                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                   banners                         │   │
│  │  • Banner                                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  └─────────────────────────────────────────────────┘   │
│                    (common)                             │
│  • BaseModel                                           │
│  • Enums                                               │
└─────────────────────────────────────────────────────────┘
```

---

## Entity Relationships

```
User (1) ────────────────── (1) Store
     │                               │
     │ 1:N                            │ 1:N
     │                               │
     ├── (1) TelegramAccount ◄───────┤
     │                               │
     │ (1) Address ◄─────────────────┤
     │
     │ (N) Orders ◄──────────────────┤
     │                               │
     └── (N) Products ────────────────┤
                                         │
                                         │ (N) Orders ◄─────────────────┘
                                         │
                                         │ (N) Orders ◄──────────────────┘

Category (1) ────────────────── (N) Product
     │                               │
     │ (0..N) Child Categories ◄─────┤

Store (1) ─────────────────── (N) Product
     │                               │
     │ (N) DeliveryZones ◄───────────┤
     │                               │
     │ (N) Orders ◄──────────────────┤

Cart (1) ─────────────────── (N) CartItem
     │
     │ (1) User ◄──────────────────────────┐
     │                                     │
     └─────────────────────────────────────┤ (N) Orders
                                              │
                                              └─────────────────┘

Order (1) ───────────────────────────────── (1) User (Customer)
     │
     │ (1) Store
     │
     │ (1) Address
     │
     │ (N) OrderItem
     │
     │ (N) Orders

OrderItem (1) ───────────────────────────────── (1) Order
     │
     │ (1) Product
     │
     │ (N) Orders

Cart (1) ─────────────────────────────────────────────────────────── (N) OrderItem
     │
     │ (1) User
     │
     │ (1) Store ◄────────────────────────────────────────────────── (N) Product
     │
     │ (N) CartItem

Banner (1) ───────────────────────────────────────────────────────── (1) Store
```

---

## Tables & Models

### 1. User (Custom User Model)

```sql
CREATE TABLE accounts_user (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150),
    is_active BOOLEAN DEFAULT FALSE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT accounts_user_phone UNIQUE (phone)
);

CREATE INDEX accounts_user_phone_idx ON accounts_user (phone);
CREATE INDEX accounts_user_active_idx ON accounts_user (is_active);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `phone`: User's phone number (unique, required)
- `first_name`: User's first name (required)
- `last_name`: User's last name (optional)
- `is_active`: Account activation status (default: false)
- `is_staff`: Staff user permission
- `is_superuser`: Admin permission
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
- `accounts_user_phone_idx`: Index on phone for fast lookups
- `accounts_user_active_idx`: Index on is_active for filtering

**Relationships**:
- One-to-one with `Store`
- One-to-one with `TelegramAccount`
- One-to-many with `Address`
- One-to-many with `Order`
- One-to-many with `Product`

---

### 2. TelegramAccount

```sql
CREATE TABLE accounts_telegram_account (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    telegram_id BIGINT UNIQUE NOT NULL,
    telegram_username VARCHAR(255) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT accounts_telegram_account_telegram_id UNIQUE (telegram_id),
    CONSTRAINT accounts_telegram_account_telegram_username UNIQUE (telegram_username)
);

CREATE INDEX accounts_telegram_account_user_idx ON accounts_telegram_account (user_id);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `user_id`: Foreign key to User
- `telegram_id`: Telegram user ID (unique)
- `telegram_username`: Telegram username (optional, unique)
- `is_verified`: Telegram verification status
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
- `accounts_telegram_account_user_idx`: Index on user_id for fast lookups

**Relationships**:
- One-to-one with `User`

---

### 3. Address

```sql
CREATE TABLE accounts_address (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    village VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    home_number VARCHAR(50) NOT NULL,
    flat_number VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT accounts_address_user_id_fkey FOREIGN KEY (user_id) REFERENCES accounts_user(id) ON DELETE CASCADE,
    CONSTRAINT accounts_address_home_number_not_null CHECK (home_number IS NOT NULL)
);

CREATE INDEX accounts_address_user_idx ON accounts_address (user_id);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `user_id`: Foreign key to User
- `village`: Village/district name
- `street`: Street name
- `home_number`: Home number
- `flat_number`: Flat/ apartment number (optional)
- `is_default`: Default address flag
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
- `accounts_address_user_idx`: Index on user_id for fast lookups

**Relationships**:
- Many-to-one with `User`

---

### 4. Verification

```sql
CREATE TABLE accounts_verification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    token VARCHAR(100) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT accounts_verification_user_id_fkey FOREIGN KEY (user_id) REFERENCES accounts_user(id) ON DELETE CASCADE,
    CONSTRAINT accounts_verification_token UNIQUE (token)
);

CREATE INDEX accounts_verification_user_idx ON accounts_verification (user_id);
CREATE INDEX accounts_verification_token_idx ON accounts_verification (token);
CREATE INDEX accounts_verification_expires_at_idx ON accounts_verification (expires_at);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `user_id`: Foreign key to User
- `token`: Verification token (unique)
- `expires_at`: Token expiration timestamp
- `is_used`: Token usage status
- `created_at`: Record creation timestamp

**Indexes**:
- `accounts_verification_user_idx`: Index on user_id for fast lookups
- `accounts_verification_token_idx`: Index on token for verification lookups
- `accounts_verification_expires_at_idx`: Index for expiration queries

**Relationships**:
- Many-to-one with `User`

---

### 5. Category

```sql
CREATE TABLE products_category (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES products_category(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT products_category_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES products_category(id) ON DELETE CASCADE,
    CONSTRAINT products_category_parent_name UNIQUE (parent_id, name),
    CONSTRAINT products_category_name_root UNIQUE (name)
);

CREATE INDEX products_category_parent_idx ON products_category (parent_id);
CREATE INDEX products_category_name_idx ON products_category (name);
CREATE INDEX products_category_active_idx ON products_category (is_active);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `parent_id`: Parent category (self-referential, nullable)
- `name`: Category name (required)
- `icon`: Category icon image URL
- `is_active`: Category active status
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
- `products_category_parent_idx`: Index on parent_id for category tree queries
- `products_category_name_idx`: Index on name for search
- `products_category_active_idx`: Index on is_active for filtering

**Relationships**:
- Self-referential (parent/child categories)
- One-to-many with `Product`

**Constraints**:
- Unique category names within same parent
- Unique category names at root level

---

### 6. Product

```sql
CREATE TABLE products_product (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores_store(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES products_category(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT products_product_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores_store(id) ON DELETE CASCADE,
    CONSTRAINT products_product_category_id_fkey FOREIGN KEY (category_id) REFERENCES products_category(id) ON DELETE RESTRICT,
    CONSTRAINT products_product_store_idx UNIQUE (store_id, name)
);

CREATE INDEX products_product_store_idx ON products_product (store_id);
CREATE INDEX products_product_category_idx ON products_product (category_id);
CREATE INDEX products_product_status_idx ON products_product (status);
CREATE INDEX products_product_name_idx ON products_product (name);
CREATE INDEX products_product_price_idx ON products_product (price);
CREATE INDEX products_product_created_idx ON products_product (created_at);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `store_id`: Foreign key to Store
- `category_id`: Foreign key to Category
- `name`: Product name (required)
- `description`: Product description
- `price`: Product price (decimal, non-negative)
- `stock`: Available stock quantity (nullable)
- `status`: Product status (draft, active, inactive)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
- `products_product_store_idx`: Index on store_id for store queries
- `products_product_category_idx`: Index on category_id for category queries
- `products_product_status_idx`: Index on status for filtering
- `products_product_name_idx`: Index on name for search
- `products_product_price_idx`: Index on price for sorting
- `products_product_created_idx`: Index on created_at for sorting

**Constraints**:
- `products_product_store_idx`: Unique product names within store

**Relationships**:
- Many-to-one with `Store`
- Many-to-one with `Category`
- One-to-many with `ProductImage`
- One-to-many with `CartItem`
- One-to-many with `OrderItem`

---

### 7. ProductImage

```sql
CREATE TABLE products_productimage (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products_product(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT products_productimage_product_id_fkey FOREIGN KEY (product_id) REFERENCES products_product(id) ON DELETE CASCADE,
    CONSTRAINT products_productimage_product_image UNIQUE (product_id, is_primary)
);

CREATE INDEX products_productimage_product_idx ON products_productimage (product_id);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `product_id`: Foreign key to Product
- `image_url`: Image file URL
- `is_primary`: Primary image flag
- `display_order`: Display order for image carousel
- `created_at`: Record creation timestamp

**Indexes**:
- `products_productimage_product_idx`: Index on product_id for queries

**Constraints**:
- `products_productimage_product_image`: Only one primary image per product

**Relationships**:
- Many-to-one with `Product`

---

### 8. Store

```sql
CREATE TABLE stores_store (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo VARCHAR(500),
    banner VARCHAR(500),
    phone VARCHAR(20) NOT NULL,
    telegram_username VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT stores_store_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES accounts_user(id) ON DELETE CASCADE,
    CONSTRAINT stores_store_name_idx UNIQUE (name)
);

CREATE INDEX stores_store_owner_idx ON stores_store (owner_id);
CREATE INDEX stores_store_name_idx ON stores_store (name);
CREATE INDEX stores_store_status_idx ON stores_store (status);
CREATE INDEX stores_store_created_idx ON stores_store (created_at);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `owner_id`: Foreign key to User (store owner)
- `name`: Store name (required, unique)
- `description`: Store description
- `logo`: Store logo image URL
- `banner`: Store banner image URL
- `phone`: Store phone number
- `telegram_username`: Store Telegram username
- `status`: Store status (pending, active, suspended, closed)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
- `stores_store_owner_idx`: Index on owner_id for owner queries
- `stores_store_name_idx`: Index on name for search
- `stores_store_status_idx`: Index on status for filtering
- `stores_store_created_idx`: Index on created_at for sorting

**Constraints**:
- `stores_store_name_idx`: Unique store names

**Relationships**:
- One-to-one with `User`
- One-to-many with `Product`
- One-to-many with `DeliveryZone`
- One-to-many with `Order`
- One-to-many with `StoreApplication`

---

### 9. DeliveryZone

```sql
CREATE TABLE stores_deliveryzone (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores_store(id) ON DELETE CASCADE,
    village VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    delivery_price DECIMAL(12, 2) NOT NULL CHECK (delivery_price >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT stores_deliveryzone_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores_store(id) ON DELETE CASCADE,
    CONSTRAINT stores_deliveryzone_village_street UNIQUE (store_id, village, street)
);

CREATE INDEX stores_deliveryzone_store_idx ON stores_deliveryzone (store_id);
CREATE INDEX stores_deliveryzone_active_idx ON stores_deliveryzone (is_active);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `store_id`: Foreign key to Store
- `village`: Village/district name
- `street`: Street name
- `delivery_price`: Delivery cost (decimal, non-negative)
- `is_active`: Zone active status
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
- `stores_deliveryzone_store_idx`: Index on store_id for store queries
- `stores_deliveryzone_active_idx`: Index on is_active for filtering

**Constraints**:
- `stores_deliveryzone_village_street`: Unique zone per store per address

**Relationships**:
- Many-to-one with `Store`

---

### 10. Village

```sql
CREATE TABLE stores_village (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT stores_village_name UNIQUE (name)
);

CREATE INDEX stores_village_name_idx ON stores_village (name);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `name`: Village name (unique)
- `created_at`: Record creation timestamp

**Indexes**:
- `stores_village_name_idx`: Index on name for lookups

**Constraints**:
- `stores_village_name`: Unique village names

**Relationships**:
- Many-to-many with `Store` (via `DeliveryZone`)

---

### 11. StoreApplication

```sql
CREATE TABLE stores_storeapplication (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    description TEXT,
    phone VARCHAR(20) NOT NULL,
    telegram_username VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT stores_storeapplication_user_id_fkey FOREIGN KEY (user_id) REFERENCES accounts_user(id) ON DELETE CASCADE,
    CONSTRAINT stores_storeapplication_name UNIQUE (store_name)
);

CREATE INDEX stores_storeapplication_user_idx ON stores_storeapplication (user_id);
CREATE INDEX stores_storeapplication_status_idx ON stores_storeapplication (status);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `user_id`: Foreign key to User
- `store_name`: Proposed store name
- `description`: Store description
- `phone`: Store phone number
- `telegram_username`: Store Telegram username
- `status`: Application status
- `rejection_reason`: Reason for rejection (if rejected)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
- `stores_storeapplication_user_idx`: Index on user_id for user queries
- `stores_storeapplication_status_idx`: Index on status for filtering

**Constraints**:
- `stores_storeapplication_name`: Unique store names

**Relationships**:
- Many-to-one with `User`

---

### 12. Cart

```sql
CREATE TABLE orders_cart (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES accounts_user(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT orders_cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES accounts_user(id) ON DELETE CASCADE
);

CREATE INDEX orders_cart_user_idx ON orders_cart (user_id);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `user_id`: Foreign key to User (unique)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
- `orders_cart_user_idx`: Index on user_id for cart lookups

**Constraints**:
- Unique cart per user

**Relationships**:
- One-to-one with `User`
- One-to-many with `CartItem`

---

### 13. CartItem

```sql
CREATE TABLE orders_cartitem (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES orders_cart(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products_product(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT orders_cartitem_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES orders_cart(id) ON DELETE CASCADE,
    CONSTRAINT orders_cartitem_product_id_fkey FOREIGN KEY (product_id) REFERENCES products_product(id) ON DELETE CASCADE,
    CONSTRAINT orders_cartitem_quantity_positive CHECK (quantity > 0),
    CONSTRAINT orders_cartitem_unique UNIQUE (cart_id, product_id)
);

CREATE INDEX orders_cartitem_cart_idx ON orders_cartitem (cart_id);
CREATE INDEX orders_cartitem_product_idx ON orders_cartitem (product_id);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `cart_id`: Foreign key to Cart
- `product_id`: Foreign key to Product
- `quantity`: Item quantity (must be positive)
- `subtotal`: Subtotal for this item (product.price * quantity)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
- `orders_cartitem_cart_idx`: Index on cart_id for cart queries
- `orders_cartitem_product_idx`: Index on product_id for product queries

**Constraints**:
- `orders_cartitem_quantity_positive`: Quantity must be positive
- `orders_cartitem_unique`: No duplicate products in cart

**Relationships**:
- Many-to-one with `Cart`
- Many-to-one with `Product`

---

### 14. Order

```sql
CREATE TABLE orders_order (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES accounts_user(id) ON DELETE RESTRICT,
    store_id BIGINT NOT NULL REFERENCES stores_store(id) ON DELETE RESTRICT,
    address_id BIGINT NOT NULL REFERENCES accounts_address(id) ON DELETE RESTRICT,
    delivery_price DECIMAL(12, 2) NOT NULL CHECK (delivery_price >= 0),
    subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
    total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivering', 'completed', 'cancelled')),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT orders_order_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES accounts_user(id) ON DELETE RESTRICT,
    CONSTRAINT orders_order_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores_store(id) ON DELETE RESTRICT,
    CONSTRAINT orders_order_address_id_fkey FOREIGN KEY (address_id) REFERENCES accounts_address(id) ON DELETE RESTRICT,
    CONSTRAINT orders_order_delivery_price_positive CHECK (delivery_price >= 0),
    CONSTRAINT orders_order_subtotal_positive CHECK (subtotal >= 0),
    CONSTRAINT orders_order_total_positive CHECK (total >= 0)
);

CREATE INDEX orders_order_customer_idx ON orders_order (customer_id);
CREATE INDEX orders_order_store_idx ON orders_order (store_id);
CREATE INDEX orders_order_address_idx ON orders_order (address_id);
CREATE INDEX orders_order_status_idx ON orders_order (status);
CREATE INDEX orders_order_created_idx ON orders_order (created_at);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `customer_id`: Foreign key to User (customer)
- `store_id`: Foreign key to Store
- `address_id`: Foreign key to Address
- `delivery_price`: Delivery cost
- `subtotal`: Subtotal of all items
- `total`: Total order price (subtotal + delivery)
- `status`: Order status
- `note`: Customer note
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
- `orders_order_customer_idx`: Index on customer_id for customer queries
- `orders_order_store_idx`: Index on store_id for store queries
- `orders_order_address_idx`: Index on address_id for address queries
- `orders_order_status_idx`: Index on status for filtering
- `orders_order_created_idx`: Index on created_at for sorting

**Constraints**:
- All monetary fields must be non-negative

**Relationships**:
- Many-to-one with `User` (customer)
- Many-to-one with `Store`
- Many-to-one with `Address`
- One-to-many with `OrderItem`

---

### 15. OrderItem

```sql
CREATE TABLE orders_orderitem (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders_order(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products_product(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT orders_orderitem_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders_order(id) ON DELETE CASCADE,
    CONSTRAINT orders_orderitem_product_id_fkey FOREIGN KEY (product_id) REFERENCES products_product(id) ON DELETE RESTRICT,
    CONSTRAINT orders_orderitem_quantity_positive CHECK (quantity > 0),
    CONSTRAINT orders_orderitem_price_positive CHECK (price >= 0),
    CONSTRAINT orders_orderitem_subtotal_positive CHECK (subtotal >= 0)
);

CREATE INDEX orders_orderitem_order_idx ON orders_orderitem (order_id);
CREATE INDEX orders_orderitem_product_idx ON orders_orderitem (product_id);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `order_id`: Foreign key to Order
- `product_id`: Foreign key to Product
- `quantity`: Item quantity (must be positive)
- `price`: Product price at time of order
- `subtotal`: Subtotal for this item (quantity * price)
- `created_at`: Record creation timestamp

**Indexes**:
- `orders_orderitem_order_idx`: Index on order_id for order queries
- `orders_orderitem_product_idx`: Index on product_id for product queries

**Constraints**:
- All monetary fields must be non-negative
- Quantity must be positive

**Relationships**:
- Many-to-one with `Order`
- Many-to-one with `Product`

---

### 16. Banner

```sql
CREATE TABLE banners_banner (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    link VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX banners_banner_active_idx ON banners_banner (is_active);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `title`: Banner title
- `image_url`: Banner image URL
- `link`: Banner link URL
- `is_active`: Banner active status
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
- `banners_banner_active_idx`: Index on is_active for filtering

**Relationships**:
- One-to-many with `Banner`

---

## Enums (CHECK Constraints)

### User Status
```sql
-- Accounts user has default Django status fields (is_active, is_staff, is_superuser)
-- No custom enum needed
```

### Product Status
```sql
status VARCHAR(20) DEFAULT 'draft'
CHECK (status IN ('draft', 'active', 'inactive'))
```

### Order Status
```sql
status VARCHAR(20) DEFAULT 'pending'
CHECK (status IN ('pending', 'confirmed', 'delivering', 'completed', 'cancelled'))
```

### Store Status
```sql
status VARCHAR(20) DEFAULT 'pending'
CHECK (status IN ('pending', 'active', 'suspended', 'closed'))
```

### Store Application Status
```sql
status VARCHAR(20) DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'rejected'))
```

---

## Database Optimizations

### Indexes
- **User**: Phone, is_active
- **Product**: store_id, category_id, status, name, price, created_at
- **Order**: customer_id, store_id, status, created_at
- **Cart**: user_id
- **CartItem**: cart_id, product_id

### Constraints
- **Uniqueness**: phone, telegram_id, telegram_username, store_name, verification_token, village/street per store
- **Foreign Keys**: ON DELETE CASCADE, ON DELETE RESTRICT
- **Check Constraints**: price >= 0, stock >= 0, quantity > 0

### Query Optimization
- **Select Related**: Use `select_related` for ForeignKey queries
- **Prefetch Related**: Use `prefetch_related` for ManyToMany queries
- **Index Usage**: Ensure queries use indexes for filtering and sorting
- **Count Queries**: Use `COUNT()` instead of `len()` for Django QuerySets

---

## Migrations

The database schema is managed through Django migrations. All migrations are in the `backend/apps/*/migrations/` directory.

**Migration Commands**:
```bash
# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Apply migrations to specific app
python manage.py migrate products

# Show migration history
python manage.py showmigrations
```

---

**Last Updated**: August 28, 2026
**Database Version**: 1.0.0
