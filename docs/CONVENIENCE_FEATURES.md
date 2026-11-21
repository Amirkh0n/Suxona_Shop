# Qulaylik funksiyalari (xaridor va sotuvchi uchun)

## Xaridor
| Funksiya | Qayerda | API |
|---|---|---|
| Parolni tiklash (kod Telegram'ga) | `/parolni-tiklash`, Login'dagi havola | `POST /auth/password-reset`, `POST /auth/password-reset/confirm` |
| Buyurtma holati tarixi (timeline) | Buyurtma sahifasi | `OrderDetail.timeline` |
| Qayta buyurtma | Yakunlangan/bekor buyurtmada | `POST /orders/{id}/reorder` |
| "Kelganda xabar ber" | Mahsulot sahifasi (tugagan bo'lsa) | `PUT/DELETE /products/{id}/notify-stock`, `GET /products/stock-alerts` |
| Narx tushganda xabar | Sevimlilardagi mahsulotlar uchun avtomatik | signal (`products/signals.py`) |
| Boy preview bilan ulashish (Open Graph) | Mahsulot "Ulashish" tugmasi | `GET /share/products/{id}`, `/share/stores/{id}` |
| Yaqin / hozir ochiq do'konlar | Bosh sahifa | `GET /stores?lat=&lng=&open_now=true` |
| Kuryer telefoni | Buyurtma sahifasi | `courier_phone` |
| Shartlar va maxfiylik | `/shartlar`, `/maxfiylik` | — |

## Sotuvchi
| Funksiya | Qayerda | API |
|---|---|---|
| CSV import / eksport (mahsulotlar) | Mahsulotlar sahifasi | `POST /products/my/import`, `GET /products/my/export` |
| SKU va kam zaxira ogohlantirishi | Mahsulot (SKU, `low_stock_threshold`) | signal; Telegram + ilova ichidagi xabar |
| Sharh/izohlarga javob | Sharhlar sahifasi | `GET /reviews/my`, `POST/DELETE /product-reviews/{id}/reply`, `/store-reviews/{id}/reply` |
| O'z promokodlari | Promokodlar sahifasi | `/stores/my/promo-codes` |
| Buyurtma varaqasini chop etish | Buyurtma sahifasi (sotuvchi) | `GET /orders/{id}/print` |
| Buyurtmalar CSV | Buyurtmalar sahifasi | `GET /orders/store/export?days=` |
| Do'kon joylashuvi | Sozlamalar | `latitude`, `longitude` |

## CSV formati (mahsulot import)
Ustunlar: `sku, name, category, price, old_price, stock, description` (vergul, nuqtali vergul yoki tab; UTF-8).
- Mahsulot SKU bo'yicha, bo'lmasa nomi bo'yicha topiladi → yangilanadi, aks holda yangisi **DRAFT** holatida yaratiladi (moderatsiyadan o'tadi).
- `category` — nomi yoki id. Xato qatorlar hisobotda ko'rsatiladi, to'g'ri qatorlar baribir saqlanadi. Eng ko'pi 500 qator.

## Parolni tiklash xavfsizligi
Kod 6 xonali, hash qilib saqlanadi, 10 daqiqa amal qiladi, 5 ta xato urinishdan keyin bloklanadi, 60 soniyada bir marta yuboriladi.
Telefon mavjudligi oshkor bo'lmaydi (javob doim bir xil). Telegram'ga ulanmagan hisob uchun kod yuborilmaydi.

## Open Graph haqida
Frontend Cloudflare Pages'da statik, shuning uchun havola preview'i backend sahifasi orqali beriladi: brauzer bo'lmagan "crawler" (Telegram, Instagram, WhatsApp) OG teglarini o'qiydi, odamlar esa darhol ilovaga yo'naltiriladi.
`SITE_BASE_URL` va `FRONTEND_BASE_URL` to'g'ri bo'lishi kerak.

## Hozircha kiritilmagan
To'lov, Celery/Redis (xabarlar hali so'rov ichida yuboriladi), web-push va SMS, sotuvchi–xaridor chati, xarita (Yandex/Google) tanlagichi, rasm thumbnail'lari.
