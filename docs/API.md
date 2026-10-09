# SuxonaShop API Documentation

## Base Configuration

- **Base URL**: `/api/v1/`
- **API Version**: 1.0.0
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer Token

## API Authentication

### Obtain Access Token

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "phone": "+998901234567",
  "password": "your-password"
}
```

**Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Refresh Access Token

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Token Headers

All protected endpoints require the following header:

```
Authorization: Bearer <access_token>
```

### Register New User

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "phone": "+998901234567",
  "first_name": "Ali",
  "last_name": "Valiyev"
}
```

**Response**:
```json
{
  "id": 1,
  "phone": "+998901234567",
  "first_name": "Ali",
  "last_name": "Valiyev",
  "telegram_account": null,
  "verification_token": "abc123xyz",
  "verification_link": "https://t.me/SuxonaShopBot?start=abc123xyz"
}
```

**Notes**:
- Account is created as inactive
- User must verify via Telegram bot
- Returns verification token and link

---

## Authentication Endpoints

### Get Current User

**Endpoint**: `GET /auth/me`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "id": 1,
  "phone": "+998901234567",
  "first_name": "Ali",
  "last_name": "Valiyev",
  "telegram_account": {
    "id": 123456789,
    "username": "ali_valiyev"
  },
  "is_active": true,
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

## Products Endpoints

### List Products

**Endpoint**: `GET /products`

**Query Parameters**:
- `page` (optional): Page number
- `category` (optional): Filter by category ID
- `store` (optional): Filter by store ID
- `search` (optional): Search by name/description
- `ordering` (optional): Sort order (price, name, created_at)

**Headers**:
```
Authorization: Bearer <access_token> (optional)
```

**Response**:
```json
{
  "count": 100,
  "next": "http://api.example.com/products?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Premium Wireless Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": 450000,
      "stock": 50,
      "status": "active",
      "category": {
        "id": 1,
        "name": "Electronics"
      },
      "store": {
        "id": 1,
        "name": "Tech Store"
      },
      "images": [
        {
          "id": 1,
          "url": "https://cdn.example.com/products/1/image1.jpg"
        }
      ],
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### Get Product Detail

**Endpoint**: `GET /products/{product_id}`

**Response**:
```json
{
  "id": 1,
  "name": "Premium Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 450000,
  "stock": 50,
  "status": "active",
  "category": {
    "id": 1,
    "name": "Electronics"
  },
  "store": {
    "id": 1,
    "name": "Tech Store",
    "logo": "https://cdn.example.com/stores/1/logo.jpg"
  },
  "images": [
    {
      "id": 1,
      "url": "https://cdn.example.com/products/1/image1.jpg",
      "is_primary": true
    },
    {
      "id": 2,
      "url": "https://cdn.example.com/products/1/image2.jpg",
      "is_primary": false
    }
  ],
  "created_at": "2026-01-01T00:00:00Z"
}
```

### Create Product (Seller Only)

**Endpoint**: `POST /products`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "category": 1,
  "name": "New Product",
  "description": "Product description",
  "price": 100000,
  "stock": 10
}
```

**Response**: 201 Created
```json
{
  "id": 2,
  "name": "New Product",
  "description": "Product description",
  "price": 100000,
  "stock": 10,
  "status": "draft",
  "category": {
    "id": 1,
    "name": "Electronics"
  },
  "store": {
    "id": 1,
    "name": "Tech Store"
  }
}
```

### Update Product (Seller Only)

**Endpoint**: `PATCH /products/{product_id}`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body** (partial update allowed):
```json
{
  "price": 120000,
  "stock": 15
}
```

### Delete Product (Seller Only)

**Endpoint**: `DELETE /products/{product_id}`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**: 204 No Content

### List My Store Products (Seller Only)

**Endpoint**: `GET /products/my`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "count": 50,
  "next": "http://api.example.com/products/my?page=2",
  "previous": null,
  "results": [...]
}
```

---

## Stores Endpoints

### List Stores

**Endpoint**: `GET /stores`

**Query Parameters**:
- `page` (optional): Page number
- `search` (optional): Search by store name

**Response**:
```json
{
  "count": 25,
  "next": "http://api.example.com/stores?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Tech Store",
      "description": "Premium electronics",
      "logo": "https://cdn.example.com/stores/1/logo.jpg",
      "rating": 4.8,
      "product_count": 342,
      "delivery_price": 15000,
      "status": "active"
    }
  ]
}
```

### Get Store Detail

**Endpoint**: `GET /stores/{store_id}`

**Response**:
```json
{
  "id": 1,
  "name": "Tech Store",
  "description": "Premium electronics",
  "logo": "https://cdn.example.com/stores/1/logo.jpg",
  "banner": "https://cdn.example.com/stores/1/banner.jpg",
  "phone": "+998901234567",
  "telegram_username": "techstore_uz",
  "rating": 4.8,
  "product_count": 342,
  "delivery_price": 15000,
  "status": "active",
  "address": "Tashkent, Amir Temur street, 1",
  "created_at": "2026-01-01T00:00:00Z"
}
```

### Get My Store (Seller Only)

**Endpoint**: `GET /stores/my`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "id": 1,
  "name": "Tech Store",
  "description": "Premium electronics",
  "logo": "https://cdn.example.com/stores/1/logo.jpg",
  "status": "active",
  ...
}
```

### Update My Store (Seller Only)

**Endpoint**: `PATCH /stores/my`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "description": "Updated description",
  "phone": "+998901234568"
}
```

### List Delivery Zones (Seller Only)

**Endpoint**: `GET /stores/{store_id}/delivery-zones`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
[
  {
    "id": 1,
    "village": "Mirzo Ulugbek",
    "street": "Mirzo Ulugbek avenue",
    "delivery_price": 15000,
    "is_active": true
  },
  {
    "id": 2,
    "village": "Chilonzor",
    "street": "Yunusobod",
    "delivery_price": 20000,
    "is_active": true
  }
]
```

### Create Delivery Zone (Seller Only)

**Endpoint**: `POST /delivery-zones`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "store": 1,
  "village": "Uchtepa",
  "street": "Uchtepa street",
  "delivery_price": 10000
}
```

---

## Orders Endpoints

### Get Cart

**Endpoint**: `GET /cart`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "cart_id": 1,
  "total_items": 5,
  "total_quantity": 3,
  "stores": [
    {
      "store": {
        "id": 1,
        "name": "Tech Store"
      },
      "items": [
        {
          "id": 1,
          "product": {
            "id": 1,
            "name": "Wireless Headphones",
            "price": 450000,
            "image": "https://cdn.example.com/products/1/image1.jpg"
          },
          "quantity": 2,
          "subtotal": 900000
        }
      ],
      "delivery_price": 15000,
      "subtotal": 900000,
      "total": 915000
    }
  ]
}
```

### Clear Cart

**Endpoint**: `DELETE /cart`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**: 204 No Content

### Add Cart Item

**Endpoint**: `POST /cart/items`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "product": 1,
  "quantity": 2
}
```

**Response**: 201 Created
```json
{
  "id": 1,
  "product": 1,
  "quantity": 2,
  "subtotal": 900000
}
```

### Update Cart Item Quantity

**Endpoint**: `PATCH /cart/items/{item_id}`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "quantity": 3
}
```

**Response**: 200 OK
```json
{
  "id": 1,
  "product": 1,
  "quantity": 3,
  "subtotal": 1350000
}
```

### Remove Cart Item

**Endpoint**: `DELETE /cart/items/{item_id}`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**: 204 No Content

### Create Order

**Endpoint**: `POST /orders`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "store": 1,
  "address": 1,
  "note": "Special instructions"
}
```

**Response**: 201 Created
```json
{
  "id": 1,
  "customer": {
    "id": 1,
    "phone": "+998901234567"
  },
  "store": {
    "id": 1,
    "name": "Tech Store"
  },
  "address": {
    "id": 1,
    "village": "Mirzo Ulugbek",
    "street": "Amir Temur street, 1"
  },
  "delivery_price": 15000,
  "subtotal": 900000,
  "total": 915000,
  "status": "pending",
  "note": "Special instructions",
  "created_at": "2026-01-01T12:00:00Z"
}
```

### List My Orders

**Endpoint**: `GET /orders/my`

**Query Parameters**:
- `page` (optional): Page number
- `status` (optional): Filter by status

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "count": 10,
  "next": "http://api.example.com/orders/my?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "store": {
        "id": 1,
        "name": "Tech Store"
      },
      "total": 915000,
      "status": "pending",
      "created_at": "2026-01-01T12:00:00Z",
      "items": [
        {
          "product": {
            "id": 1,
            "name": "Wireless Headphones"
          },
          "quantity": 2,
          "price": 450000,
          "subtotal": 900000
        }
      ]
    }
  ]
}
```

### Get Order Detail

**Endpoint**: `GET /orders/{order_id}`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "id": 1,
  "customer": {
    "id": 1,
    "first_name": "Ali",
    "last_name": "Valiyev"
  },
  "store": {
    "id": 1,
    "name": "Tech Store"
  },
  "address": {
    "id": 1,
    "village": "Mirzo Ulugbek",
    "street": "Amir Temur street, 1",
    "home_number": "10A"
  },
  "delivery_price": 15000,
  "subtotal": 900000,
  "total": 915000,
  "status": "pending",
  "status_history": [
    {
      "status": "pending",
      "created_at": "2026-01-01T12:00:00Z"
    }
  ],
  "items": [
    {
      "product": {
        "id": 1,
        "name": "Wireless Headphones",
        "price": 450000,
        "image": "https://cdn.example.com/products/1/image1.jpg"
      },
      "quantity": 2,
      "price": 450000,
      "subtotal": 900000
    }
  ],
  "note": "Special instructions",
  "created_at": "2026-01-01T12:00:00Z"
}
```

### Cancel Order

**Endpoint**: `POST /orders/{order_id}/cancel`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**: 200 OK
```json
{
  "id": 1,
  "status": "cancelled",
  ...
}
```

---

## Address Endpoints

### List My Addresses

**Endpoint**: `GET /addresses`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
[
  {
    "id": 1,
    "village": "Mirzo Ulugbek",
    "street": "Amir Temur street",
    "home_number": "10A",
    "flat_number": "5",
    "is_default": true,
    "created_at": "2026-01-01T00:00:00Z"
  }
]
```

### Create Address

**Endpoint**: `POST /addresses`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "village": "Chilonzor",
  "street": "Yunusobod",
  "home_number": "20",
  "flat_number": "3",
  "is_default": true
}
```

**Response**: 201 Created
```json
{
  "id": 2,
  "village": "Chilonzor",
  "street": "Yunusobod",
  "home_number": "20",
  "flat_number": "3",
  "is_default": false,
  "created_at": "2026-01-01T00:00:00Z"
}
```

### Update Address

**Endpoint**: `PATCH /addresses/{address_id}`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "home_number": "22",
  "is_default": true
}
```

### Delete Address

**Endpoint**: `DELETE /addresses/{address_id}`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**: 204 No Content

---

## Store Applications Endpoints

### Create Store Application

**Endpoint**: `POST /store-applications`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "store_name": "My New Store",
  "description": "Description of my store",
  "phone": "+998901234567",
  "telegram_username": "my_store"
}
```

**Response**: 201 Created
```json
{
  "id": 1,
  "store_name": "My New Store",
  "description": "Description of my store",
  "phone": "+998901234567",
  "telegram_username": "my_store",
  "status": "pending",
  "created_at": "2026-01-01T00:00:00Z"
}
```

### List Pending Applications (Admin Only)

**Endpoint**: `GET /admin/store-applications`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
[
  {
    "id": 1,
    "store_name": "My New Store",
    "status": "pending",
    "created_at": "2026-01-01T00:00:00Z"
  }
]
```

### Approve Store Application (Admin Only)

**Endpoint**: `POST /admin/store-applications/{application_id}/approve`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**: 200 OK
```json
{
  "id": 1,
  "store_name": "My New Store",
  "status": "approved",
  "created_at": "2026-01-01T00:00:00Z"
}
```

### Reject Store Application (Admin Only)

**Endpoint**: `POST /admin/store-applications/{application_id}/reject`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "rejection_reason": "Store name already exists"
}
```

**Response**: 200 OK
```json
{
  "id": 1,
  "store_name": "My New Store",
  "status": "rejected",
  "rejection_reason": "Store name already exists",
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

## Banners Endpoints

### List Active Banners

**Endpoint**: `GET /banners/`

**Headers**:
```
Authorization: Bearer <access_token> (optional)
```

**Response**:
```json
[
  {
    "id": 1,
    "title": "Summer Sale - Up to 50% Off",
    "image": "https://cdn.example.com/banners/1/image.jpg",
    "link": "/products",
    "is_active": true,
    "created_at": "2026-01-01T00:00:00Z"
  }
]
```

### Create Banner (Admin Only)

**Endpoint**: `POST /banners/`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "title": "New Collection",
  "image": "https://cdn.example.com/banners/new/image.jpg",
  "link": "/collections",
  "is_active": true
}
```

---

## Telegram Verification

### Complete Telegram Verification

**Endpoint**: `POST /auth/telegram/verify`

**Headers**:
```
X-Telegram-Bot-Api-Secret-Token: <your_token>
```

**Request Body**:
```json
{
  "verification_token": "abc123xyz",
  "telegram_id": 123456789
}
```

**Response**: 200 OK
```json
{
  "user": {
    "id": 1,
    "phone": "+998901234567",
    "first_name": "Ali",
    "last_name": "Valiyev",
    "telegram_account": {
      "id": 123456789,
      "username": "ali_valiyev"
    },
    "is_active": true
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Errors**:
- 403 Forbidden: Token verification not configured
- 404 Not Found: Invalid token
- 409 Conflict: Telegram already linked
- 410 Gone: Token expired or consumed

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no response body
- **400 Bad Request**: Validation error or invalid input
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., duplicate)
- **422 Unprocessable Entity**: Business logic validation error
- **500 Internal Server Error**: Server error

---

## API Documentation Tool

### Swagger UI
- URL: `http://localhost:8000/api/docs/`
- Interactive API documentation with try-it-out functionality

### ReDoc
- URL: `http://localhost:8000/api/redoc/`
- Alternative documentation format

### OpenAPI Schema
- URL: `http://localhost:8000/api/schema/`
- Raw OpenAPI 3.0 schema (JSON)

---

## Rate Limiting

Rate limiting is applied to API endpoints to prevent abuse.

- **Public Endpoints**: Limited by IP address
- **Authenticated Endpoints**: Limited per user account
- **Rate Limit**: 100 requests per minute (default)

---

**Last Updated**: August 28, 2026
**API Version**: 1.0.0
