# SuxonaShop Database Schema v1

## User

```text
User
├── id
├── phone (unique)
├── first_name
├── last_name
├── is_active
├── is_staff
├── created_at
└── updated_at
```

Relationships:

```text
User
├── 1:1 Cart
├── 1:N Address
├── 1:N Order
├── 1:1 Store (optional)
└── 1:1 TelegramAccount (optional)
```

---

## Store

```text
Store
├── id
├── owner_id (User)
├── name
├── description
├── logo
├── banner
├── phone
├── telegram_username
├── status
├── created_at
└── updated_at
```

Store Status:

```text
PENDING
ACTIVE
SUSPENDED
REJECTED
```

Relationships:

```text
Store
├── 1:N Product
├── 1:N DeliveryZone
└── 1:N Order
```

---

## StoreApplication

```text
StoreApplication
├── id
├── owner_id
├── store_name
├── phone
├── status
├── admin_note
├── created_at
└── updated_at
```

---

## Village

```text
Village
├── id
├── name
├── district
├── is_active
├── created_at
└── updated_at
```

Admin tomonidan boshqariladi.

---

## DeliveryZone

```text
DeliveryZone
├── id
├── store_id
├── village_id
├── delivery_price
├── is_active
├── created_at
└── updated_at
```

Har bir do'kon o'zi xizmat ko'rsatadigan qishloqlar va narxlarni belgilaydi.

---

## Category

```text
Category
├── id
├── parent_id (nullable)
├── name
├── icon
├── is_active
├── created_at
└── updated_at
```

Faqat admin boshqaradi.

---

## Product

```text
Product
├── id
├── store_id
├── category_id
├── name
├── description
├── price
├── stock (nullable)
├── status
├── created_at
└── updated_at
```

Product Status:

```text
DRAFT
ACTIVE
OUT_OF_STOCK
HIDDEN
```

---

## ProductImage

```text
ProductImage
├── id
├── product_id
├── image
├── is_primary
├── sort_order
├── created_at
└── updated_at
```

---

## Address

```text
Address
├── id
├── user_id
├── village_id
├── street
├── house
├── landmark
├── is_default
├── created_at
└── updated_at
```

---

## Cart

```text
Cart
├── id
├── user_id
├── created_at
└── updated_at
```

Har bir foydalanuvchida bitta savat bo'ladi.

---

## CartItem

```text
CartItem
├── id
├── cart_id
├── product_id
├── quantity
├── created_at
└── updated_at
```

Muhim:

```text
Cart
 └── CartItem
        └── Product
               └── Store
```

Savat bir nechta do'kon mahsulotlarini saqlashi mumkin.

Frontend savatni do'konlar bo'yicha guruhlaydi.

Har bir do'kon uchun alohida "Buyurtma berish" tugmasi mavjud.

---

## Order

```text
Order
├── id
├── customer_id
├── store_id
├── address_id
├── delivery_price
├── subtotal
├── total
├── status
├── note
├── created_at
└── updated_at
```

Order Status:

```text
PENDING
ACCEPTED
DELIVERING
COMPLETED
CANCELLED
REJECTED
```

Muhim qoida:

```text
1 Order = 1 Store
```

Agar savatda 3 xil do'kon mahsulotlari bo'lsa:

```text
Store A → Order #101

Store B → Order #102

Store C → Order #103
```

alohida yaratiladi.

---

## OrderItem

```text
OrderItem
├── id
├── order_id
├── product_id
├── price
├── quantity
├── subtotal
├── created_at
└── updated_at
```

Order yaratilganda mahsulot narxi shu yerda saqlanadi.

Kelajakda mahsulot narxi o'zgarsa ham eski buyurtma buzilmaydi.

---

## Banner

```text
Banner
├── id
├── title
├── image
├── url
├── is_active
├── sort_order
├── created_at
└── updated_at
```

---

## TelegramAccount

```text
TelegramAccount
├── id
├── user_id
├── telegram_id
├── username
├── linked_at
└── updated_at
```

Telegram bildirishnomalari uchun ishlatiladi.

````

---

## Marketplace Rules

```text
1 User = max 1 Store

1 Cart = many Stores

1 Order = 1 Store

Categories = Admin only

Villages = Admin only

Delivery price = Seller defined

Payment = Cash on delivery

Seller delivers products himself
````
