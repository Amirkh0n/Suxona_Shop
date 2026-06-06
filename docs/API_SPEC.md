# API_SPEC.md

# SuxonaShop API Specification

Version: 1.0

Base URL:

```text
/api/v1/
```

Authentication:

```text
JWT Authentication
```

Format:

```text
application/json
```

---

# 1. Authentication

## Register

```http
POST /auth/register
```

Request:

```json
{
  "phone": "+998901234567",
  "first_name": "Ali",
  "last_name": "Valiyev"
}
```

Response:

```json
{
  "id": 1,
  "phone": "+998901234567"
}
```

---

## Login

```http
POST /auth/login
```

Request:

```json
{
  "phone": "+998901234567"
}
```

Response:

```json
{
  "access": "jwt_token",
  "refresh": "jwt_refresh_token"
}
```

---

## Current User

```http
GET /auth/me
```

Response:

```json
{
  "id": 1,
  "phone": "+998901234567",
  "first_name": "Ali"
}
```

---

# 2. Stores

## Create Store Application

```http
POST /store-applications
```

Request:

```json
{
  "store_name": "Alijon Market",
  "phone": "+998901111111"
}
```

---

## My Store

```http
GET /stores/my
```

Returns seller store.

---

## Public Store List

```http
GET /stores
```

Filters:

```text
search
page
```

---

## Store Detail

```http
GET /stores/{id}
```

---

## Update Store

```http
PATCH /stores/my
```

Permission:

```text
Store Owner
```

---

# 3. Categories

## List Categories

```http
GET /categories
```

Public endpoint.

---

## Create Category

```http
POST /categories
```

Permission:

```text
Admin
```

---

## Update Category

```http
PATCH /categories/{id}
```

Admin only.

---

## Delete Category

```http
DELETE /categories/{id}
```

Admin only.

---

# 4. Villages

## List Villages

```http
GET /villages
```

Public.

---

## Create Village

```http
POST /villages
```

Admin only.

---

## Update Village

```http
PATCH /villages/{id}
```

Admin only.

---

## Delete Village

```http
DELETE /villages/{id}
```

Admin only.

---

# 5. Delivery Zones

## List Store Delivery Zones

```http
GET /stores/{id}/delivery-zones
```

---

## Create Delivery Zone

```http
POST /delivery-zones
```

Request:

```json
{
  "village_id": 1,
  "delivery_price": 5000
}
```

Permission:

```text
Store Owner
```

---

## Update Delivery Zone

```http
PATCH /delivery-zones/{id}
```

---

## Delete Delivery Zone

```http
DELETE /delivery-zones/{id}
```

---

# 6. Products

## Product List

```http
GET /products
```

Filters:

```text
category
store
search
ordering
page
```

---

## Product Detail

```http
GET /products/{id}
```

---

## Create Product

```http
POST /products
```

Permission:

```text
Store Owner
```

Request:

```json
{
  "category_id": 1,
  "name": "Yog'",
  "description": "Mahsulot tavsifi",
  "price": 25000,
  "stock": 10
}
```

---

## Update Product

```http
PATCH /products/{id}
```

Store owner only.

---

## Delete Product

```http
DELETE /products/{id}
```

Store owner only.

---

## My Products

```http
GET /products/my
```

Store owner only.

---

# 7. Product Images

## Upload Product Image

```http
POST /products/{id}/images
```

Multipart upload.

Stored in Cloudflare R2.

---

## Delete Product Image

```http
DELETE /product-images/{id}
```

---

## Reorder Images

```http
POST /products/{id}/images/reorder
```

Request:

```json
{
  "images": [3, 2, 1]
}
```

---

# 8. Cart

## Get My Cart

```http
GET /cart
```

Returns grouped-by-store structure.

Example:

```json
{
  "stores": [
    {
      "store_id": 1,
      "store_name": "Alijon Market",
      "items": []
    }
  ]
}
```

---

## Add To Cart

```http
POST /cart/items
```

Request:

```json
{
  "product_id": 5,
  "quantity": 2
}
```

---

## Update Cart Item

```http
PATCH /cart/items/{id}
```

---

## Remove Cart Item

```http
DELETE /cart/items/{id}
```

---

## Clear Cart

```http
DELETE /cart
```

---

# 9. Addresses

## List Addresses

```http
GET /addresses
```

---

## Create Address

```http
POST /addresses
```

Request:

```json
{
  "village_id": 1,
  "street": "Mustaqillik",
  "house": "12",
  "landmark": "Masjid yonida"
}
```

---

## Update Address

```http
PATCH /addresses/{id}
```

---

## Delete Address

```http
DELETE /addresses/{id}
```

---

# 10. Orders

## Create Order From Store Cart

Important:

Creates order only for one store.

```http
POST /orders
```

Request:

```json
{
  "store_id": 1,
  "address_id": 2,
  "note": "Qo'ng'iroq qiling"
}
```

Server:

```text
Takes all cart items belonging to store_id
Creates order
Removes only those items from cart
```

---

## My Orders

```http
GET /orders/my
```

Customer only.

---

## Order Detail

```http
GET /orders/{id}
```

---

## Cancel Order

```http
POST /orders/{id}/cancel
```

Rule:

```text
Only PENDING orders can be cancelled.
```

---

# 11. Seller Orders

## Seller Order List

```http
GET /seller/orders
```

Filters:

```text
status
page
```

---

## Accept Order

```http
POST /seller/orders/{id}/accept
```

Changes:

```text
PENDING → ACCEPTED
```

---

## Reject Order

```http
POST /seller/orders/{id}/reject
```

Request:

```json
{
  "reason": "Mahsulot mavjud emas"
}
```

Changes:

```text
PENDING → REJECTED
```

---

## Mark Delivering

```http
POST /seller/orders/{id}/delivering
```

Changes:

```text
ACCEPTED → DELIVERING
```

---

## Complete Order

```http
POST /seller/orders/{id}/complete
```

Changes:

```text
DELIVERING → COMPLETED
```

---

# 12. Banners

## Public Banner List

```http
GET /banners
```

Returns active banners.

---

## Create Banner

```http
POST /banners
```

Admin only.

---

## Update Banner

```http
PATCH /banners/{id}
```

Admin only.

---

## Delete Banner

```http
DELETE /banners/{id}
```

Admin only.

---

# 13. Telegram

## Link Telegram Account

```http
POST /telegram/link
```

---

## Unlink Telegram Account

```http
POST /telegram/unlink
```

---

# 14. Admin APIs

## Pending Stores

```http
GET /admin/store-applications
```

---

## Approve Store

```http
POST /admin/store-applications/{id}/approve
```

Creates Store.

---

## Reject Store

```http
POST /admin/store-applications/{id}/reject
```

---

## Suspend Store

```http
POST /admin/stores/{id}/suspend
```

---

## Reactivate Store

```http
POST /admin/stores/{id}/activate
```

---

# 15. Pagination

All collection endpoints use:

```json
{
  "count": 120,
  "next": "...",
  "previous": "...",
  "results": []
}
```

---

# 16. Permissions Matrix

| Endpoint         | Customer | Seller | Admin |
| ---------------- | -------- | ------ | ----- |
| Products View    | ✅        | ✅      | ✅     |
| Products Create  | ❌        | ✅      | ✅     |
| Cart             | ✅        | ✅      | ✅     |
| Orders Create    | ✅        | ✅      | ✅     |
| Store Management | ❌        | ✅      | ✅     |
| Categories CRUD  | ❌        | ❌      | ✅     |
| Villages CRUD    | ❌        | ❌      | ✅     |
| Banners CRUD     | ❌        | ❌      | ✅     |

---

# 17. Future APIs (Not MVP)

Excluded:

* Reviews
* Ratings
* Favorites
* Coupons
* Online Payments
* Chat
* AI Assistant
* Courier System

These APIs will be introduced in future versions.
