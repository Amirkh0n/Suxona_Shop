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
| 3 | **Telegram bot — webhook, sinxron** (`POST /api/v1/telegram/webhook`, secret header bilan): `/start verify_<token>` ro'yxatdan o'tishni tasdiqlaydi; `set_telegram_webhook` buyrug'i. Polling yo'q, asyncio/Celery yo'q |
| 3a | **Xabarnomalar havola bilan**: yangi ariza → admin; ariza natijasi → ega; yangi buyurtma → sotuvchi; buyurtma holati → mijoz; bekor qilish → sotuvchi |
| 4 | Xabarlar `transaction.on_commit` orqali (rollback bo'lsa yuborilmaydi), Telegram xatosi asosiy jarayonni buzmaydi |
| 5 | **Bug fix**: bekor/rad etilgan buyurtma zaxirani qaytaradi (`restock_order_items`); **checkout Postgres'da variantsiz mahsulotda yiqilardi** (`FOR UPDATE` + outer join) — tuzatildi |
| 6 | **Xavfsizlik**: CORS allow-list (`DJANGO_CORS_ALLOWED_ORIGINS`, prod'da yopiq), rate-limit (login/register 10/min) |
| 7 | **Cloudflare R2** `STORAGES` ulandi (`CLOUDFLARE_R2_*`, frontend `VITE_IMAGE_BASE_URL` bilan juft) |
| 8 | Logging, WhiteNoise (admin static), **Jazzmin** admin (maxsus dashboard: KPI, kutilayotgan arizalar, 7 kunlik grafik; o'zbekcha UI), admin sarlavhalari |
| 9 | Docker: non-root, collectstatic, healthcheck, `.env` (endi `.env.example` emas) |
| 10 | **CI** (GitHub Actions): ruff, migrations check, pytest, frontend lint+build |
| 11 | **Testlar**: 31 ta (ariza, admin tugmalari, bot/webhook, xabarnomalar, restock, checkout, throttle) |

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
1. Telegram yuborish hozir so'rov ichida sinxron (timeout 5s). Trafik oshsa — Celery/outbox.
2. Bot ichida buyurtmani qabul/rad etish tugmalari (inline keyboard).

**D. Operatsion**
Sentry, health endpoint, zaxira (backup) rejasi, staging muhit, Redis+Celery (xabarlar/muddati o'tgan buyurtmalar uchun), to'lov (Payme/Click) — MVP'dan keyin.

**E. Frontend**
Admin API ulanishlari, sotuvchi buyurtma bildirishnomalari, PWA offline, testlar (Vitest).

## Round 4 — order flow, idempotency, moderation

| # | Change |
|---|--------|
| 1 | **Order state machine** (`apps/orders/state_machine.py`): one `ALLOWED_TRANSITIONS` table, every service goes through `apply_transition` (row lock + restock). Cancel rules per role: customer from PENDING, seller from ACCEPTED, staff from any non-terminal. Admin `status` field is read-only; admin gets a *cancel* action. |
| 2 | **Idempotent checkout**: `Idempotency-Key` header on `POST /orders` (`IdempotencyKey` model, migration `orders/0004`). Replay → 200 + `Idempotent-Replayed: true`; same key, other payload → 422; failed checkout leaves no key. Frontend sends a UUID per distinct payload. Cleanup: `manage.py purge_idempotency_keys` (cron, daily). |
| 3 | **Product moderation**: statuses `PENDING_REVIEW`, `REJECTED`; fields `approved_at/reviewed_by/reviewed_at/moderation_note` (migrations `products/0005-0006`, existing live products are backfilled as approved). Sellers cannot self-activate unapproved products; submitting needs >=1 image. Admin approves/rejects on the product page (buttons) or via bulk action; seller and admins get Telegram messages. Non-public products (draft/pending/rejected/hidden) now 404 for strangers. |
| 4 | Tests: 59 total. |

Known limits: editing an already-approved product does not trigger re-review; list endpoints still return page 1 only in the seller UI.

