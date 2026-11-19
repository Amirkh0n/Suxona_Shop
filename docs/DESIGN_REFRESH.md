# Design refresh — what changed

Backend (migrations required: `python manage.py migrate`)
- Product `old_price` → `discount_percent`; `GET /products?on_sale=true`
- Store: `min_order_amount`, `opens_at`/`closes_at`, `delivery_time`, `allows_pickup`, `rating_avg/count`
- Reviews: `POST /orders/<id>/review` (completed orders only, one per order), `GET /stores/<id>/reviews`
- Orders: `delivery_method` DELIVERY|PICKUP, optional `address_id` for pickup, `contact_name/phone`, min-order check
- Favorites: `GET /favorites`, `GET /favorites/ids`, `PUT|DELETE /products/<id>/favorite`
- Telegram: seller order messages have inline Accept/Reject/Deliver/Complete/Cancel buttons (webhook must allow `callback_query`; re-run set-webhook)

Frontend
- Server-synced favorites + /sevimlilar page, discount badges/old price, "Chegirmalar" on home
- Checkout: delivery vs pickup, contact details, min-order warning
- Store page: rating, facts, reviews; order page: star rating after completion
- Seller: old price in product form, new store settings
