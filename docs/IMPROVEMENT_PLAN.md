# SuxonaShop — production-ready yo'l xaritasi

Holat: 2026-10-17. Backend birinchi, keyin frontend. ✅ = shu bosqichda bajarildi.

## 1. Audit natijasi (qisqacha)

**Yaxshi (saqlanadi):** services/selectors arxitekturasi, custom `User` (telefon),
JWT, `select_for_update` bilan poyga-xavfsiz servislar, yaxshi indekslar,
`apps/common/admin.py`dagi badge/preview yordamchilari, mavjud admin amallari.

**Kamchiliklar:** testlar yo'q edi · bot yo'q (bo'sh stub) · tasdiqlash/rad etishda
xabarnoma va audit yo'q · bekor/rad etilgan buyurtma zaxirani qaytarmasdi (bug) ·
CORS hammaga ochiq · rate-limit yo'q · R2 sozlanmagan (faqat env) · logging yo'q ·
CI yo'q · Dockerfile root, collectstatic yo'q · admin dizayni standart.

## 2. Bu bosqichda bajarildi ✅

| # | Ish |
|---|-----|
| 1 | **Do'kon arizasi → Store**: admin'da bitta ariza sahifasida "Approve / Reject" tugmalari + ommaviy amallar; `ApproveStoreService` Store yaratadi |
| 2 | **Audit**: `StoreApplication.reviewed_by / reviewed_at` (migratsiya 0002), REST va admin ikkalasida |
| 3 | **Telegram bot** (`manage.py run_telegram_bot`, long polling): `/start verify_<token>` ro'yxatdan o'tishni tasdiqlaydi; ariza tasdiqlansa/rad etilsa egasiga xabar; yangi ariza haqida admin chatga xabar (`TELEGRAM_ADMIN_CHAT_ID`) |
| 4 | Xabarlar `transaction.on_commit` orqali (rollback bo'lsa yuborilmaydi), Telegram xatosi asosiy jarayonni buzmaydi |
| 5 | **Bug fix**: bekor/rad etilgan buyurtma zaxirani qaytaradi (`restock_order_items`) |
| 6 | **Xavfsizlik**: CORS allow-list (`DJANGO_CORS_ALLOWED_ORIGINS`, prod'da yopiq), rate-limit (login/register 10/min) |
| 7 | **Cloudflare R2** `STORAGES` ulandi (`CLOUDFLARE_R2_*`, frontend `VITE_IMAGE_BASE_URL` bilan juft) |
| 8 | Logging, WhiteNoise (admin static), **django-admin-interface** temasi, admin sarlavhalari |
| 9 | Docker: non-root, collectstatic, healthcheck, `bot` servisi, `.env` (endi `.env.example` emas) |
| 10 | **CI** (GitHub Actions): ruff, migrations check, pytest, frontend lint+build |
| 11 | **Testlar**: 13 ta (ariza ko'rib chiqish, admin tugmalari, bot verify, restock, throttle) |

## 3. Keyingi bosqichlar (tavsiya etilgan tartib)

**A. Backend barqarorligi**
1. Order holat mashinasi: yagona `ALLOWED_TRANSITIONS`, sotuvchi/admin bekor qilish (ACCEPTED'dan), `reject/cancel` admin amallari.
2. Checkout idempotentligi (`Idempotency-Key`), PENDING buyurtma uchun zaxira muddati.
3. Mahsulot moderatsiyasi: sotuvchi `ACTIVE` qila olmasin → `PENDING_REVIEW` → admin tasdiqlaydi (+ Telegram xabar).
4. `StoreApplication`: DB darajasida "bitta PENDING" cheklovi (partial unique constraint).
5. Soft-delete + audit log (django-simple-history).
6. `ProductAdmin` ommaviy amallarini servis orqali o'tkazish; filtrlar `filters/` ga (django-filter).
7. Qolgan testlar: products, orders checkout, accounts auth (hozir ~13 ta, maqsad ≥80% servis qamrovi).

**B. Admin panel (loyiha admini)**
1. Dashboard: kutilayotgan arizalar, bugungi buyurtmalar, daromad, kam zaxira.
2. Rol/guruhlar (Moderator, Support) — hozir faqat `is_staff`.
3. Buyurtmalar uchun to'liq holat boshqaruvi + eksport (CSV).

**C. Telegram bot kengaytmasi**
1. Buyurtma holati o'zgarganda mijozga, yangi buyurtma kelganda sotuvchiga xabar.
2. Webhook rejimi (prod): `handle_update` allaqachon sof funksiya.
3. Bot ichida buyurtmani qabul/rad etish tugmalari (inline keyboard).

**D. Operatsion**
Sentry, health endpoint, zaxira (backup) rejasi, staging muhit, Redis+Celery (xabarlar/muddati o'tgan buyurtmalar uchun), to'lov (Payme/Click) — MVP'dan keyin.

**E. Frontend**
Admin API ulanishlari, sotuvchi buyurtma bildirishnomalari, PWA offline, testlar (Vitest).
