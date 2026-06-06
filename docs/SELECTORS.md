# SELECTORS.md

# SuxonaShop Selectors Architecture

Version: 1.0

Status: MVP

---

# 1. Purpose

Selectors are responsible for reading data from the database.

Selectors must:

* Encapsulate reusable queries
* Reduce duplicate query logic
* Keep views clean
* Keep services focused on business logic

Selectors are read-only.

Selectors must never:

* Create records
* Update records
* Delete records

Those operations belong to services.

---

# 2. Architecture Rule

```text
View
  ↓
Selector
  ↓
Database
```

or

```text
Service
  ↓
Selector
  ↓
Database
```

---

# 3. Naming Convention

Selector files:

```text
product_selector.py
store_selector.py
order_selector.py
```

Selector classes:

```python
ProductSelector
StoreSelector
OrderSelector
```

Methods must describe what they return.

Examples:

```python
get_active_products()

get_store_by_id()

get_user_orders()

get_order_by_id()
```

---

# 4. Accounts Selectors

Location:

```text
apps/accounts/selectors/
```

---

## UserSelector

Methods:

```python
get_user_by_id(user_id)

get_user_by_phone(phone)

user_has_store(user_id)

user_has_pending_store_application(user_id)
```

---

## AddressSelector

Methods:

```python
get_user_addresses(user_id)

get_default_address(user_id)

get_address_by_id(address_id)

get_user_address(user_id, address_id)
```

---

# 5. Stores Selectors

Location:

```text
apps/stores/selectors/
```

---

## StoreSelector

Methods:

```python
get_store_by_id(store_id)

get_active_store_by_id(store_id)

get_store_by_owner(user_id)

get_active_stores()

search_stores(query)

store_exists(store_id)
```

---

## StoreApplicationSelector

Methods:

```python
get_application_by_id(application_id)

get_pending_application(application_id)

get_user_pending_application(user_id)

get_pending_applications()
```

---

## VillageSelector

Methods:

```python
get_village_by_id(village_id)

get_active_villages()
```

---

## DeliveryZoneSelector

Methods:

```python
get_delivery_zone(store_id, village_id)

get_store_delivery_zones(store_id)

store_delivers_to_village(
    store_id,
    village_id
)
```

---

# 6. Products Selectors

Location:

```text
apps/products/selectors/
```

---

## CategorySelector

Methods:

```python
get_category_by_id(category_id)

get_active_categories()

get_root_categories()
```

---

## ProductSelector

Methods:

```python
get_product_by_id(product_id)

get_active_product(product_id)

get_active_products()

get_store_products(store_id)

search_products(query)

get_products_by_category(category_id)

get_products_for_checkout(
    store_id,
    product_ids
)
```

Requirements:

```text
Use select_related()

Use prefetch_related()
where beneficial
```

---

## ProductImageSelector

Methods:

```python
get_product_images(product_id)

get_primary_image(product_id)
```

---

# 7. Orders Selectors

Location:

```text
apps/orders/selectors/
```

---

## CartSelector

Methods:

```python
get_user_cart(user_id)

get_cart_by_id(cart_id)
```

---

## CartItemSelector

Methods:

```python
get_cart_items(cart_id)

get_cart_store_items(
    cart_id,
    store_id
)

cart_has_store_items(
    cart_id,
    store_id
)
```

Important:

```text
Cart may contain products
from multiple stores.
```

Selectors must support grouping by store.

---

## OrderSelector

Methods:

```python
get_order_by_id(order_id)

get_customer_order(
    customer_id,
    order_id
)

get_store_order(
    store_id,
    order_id
)

get_customer_orders(customer_id)

get_store_orders(store_id)

get_orders_by_status(status)
```

---

## OrderItemSelector

Methods:

```python
get_order_items(order_id)
```

---

# 8. Banners Selectors

Location:

```text
apps/banners/selectors/
```

---

## BannerSelector

Methods:

```python
get_active_banners()

get_banner_by_id(banner_id)
```

Ordering:

```python
sort_order
```

---

# 9. Query Optimization

Required:

```python
select_related()

prefetch_related()
```

when relationships are used.

Example:

```python
Order.objects.select_related(
    "customer",
    "store",
    "address"
)
```

---

# 10. Pagination

Selectors should return QuerySets whenever possible.

Do not paginate inside selectors.

Pagination belongs to:

```text
Views
API Layer
```

---

# 11. Filtering

Filtering belongs inside selectors.

Examples:

```python
get_active_products()

get_store_orders()

search_products()
```

---

# 12. Error Handling

Selectors should not raise business exceptions.

Bad:

```python
raise ProductNotAvailableError
```

Good:

```python
return None
```

or

```python
raise Product.DoesNotExist
```

Business exceptions belong to services.

---

# 13. Forbidden Logic

Selectors must not:

* Create orders
* Create stores
* Change status
* Calculate totals
* Validate checkout

Bad Example:

```python
approve_store()
```

Good Example:

```python
get_pending_store()
```

---

# 14. Performance Rules

Avoid:

```python
for product in products:
    product.images.all()
```

Use:

```python
prefetch_related("images")
```

Avoid N+1 queries.

---

# 15. Testing Requirements

Each selector must have tests.

Verify:

* Correct filtering
* Correct ordering
* Related objects loading
* Empty results

---

# 16. Final Rule

Selectors are the only layer responsible for reusable database read operations.

Views and Services should not duplicate query logic.

Whenever a query is reused more than once, move it into a selector.
