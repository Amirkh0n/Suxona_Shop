# Growth features (branch `claude/growth-features`)

Deploy: `python manage.py migrate` (new: notifications, common/audit, products reviews + rating,
orders promo/returns/courier). No new required env vars.

## API additions
| Area | Endpoints |
|---|---|
| Catalog | `GET /products?search&categories&store&on_sale&in_stock&min_price&max_price&ordering=new\|price_asc\|price_desc\|popular\|discount\|rating`, `GET /products/<id>/similar` |
| Product reviews | `GET/POST /products/<id>/reviews` (POST: only buyers of a COMPLETED order, once per product) |
| Promo codes | `POST /promo/check {store_id, code}`; `promo_code` on `POST /orders` (percent/fixed, cap, min order, validity, max uses, once per customer; use is returned on cancel/reject) |
| Notifications | `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/read-all`, `POST /notifications/<id>/read` |
| Seller | `GET /orders/store/stats?days=`, `GET /products/my?search&status`, courier on `POST /orders/<id>/delivering` |
| Returns | `POST /orders/<id>/return` (completed, within 7 days), `POST /orders/<id>/return/decide` (seller) |
| Orders | `delivery_slot` (customer's preferred window), `courier_name/phone` |

## Behaviour changes
- Editing **name, description, category** or adding/removing an **image** on a live (approved) product sends it back to `PENDING_REVIEW`. Price, stock and discount edits stay live.
- Uploaded product images are converted to WebP, max 1600px.
- Audit log (admin → Audit jurnali, read-only): product approve/reject/re-moderation, store application decisions, return decisions, review hiding.
- Admin: Promokodlar, Mahsulot sharhlari (hide action recalculates rating), Qaytarish so'rovlari, Bildirishnomalar.

## Optional infrastructure
- `SENTRY_DSN` (+ `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE`): error tracking; `sentry-sdk` is in `requirements/production.txt`.
- `REDIS_URL`: shared cache between workers (default is per-process memory).
- Not done on purpose: Celery (Telegram messages are still sent inside the request after commit).

## Frontend
- Server-side filter/sort sheet, search suggestions + recent searches, bell with unread count + notifications page.
- Uzbek/Russian (`src/i18n`); translated: navigation, header, home headings, product list/filter, profile, order statuses, notifications. Other screens fall back to Uzbek until their strings are moved to the dictionaries.
- PWA: `public/sw.js` (assets cache-first, pages network-first, API never cached) + `offline.html`; registered only in production builds.
- Product page: real rating, reviews, similar products, share. Checkout: promo code + delivery window. Order page: courier, return request.
- Seller: revenue chart (7/30/90 days), top products, product search/pagination/bulk hide-show.
- Tests: `npm test` (Vitest). Lint: `npm run lint` (oxlint). CI: `.github/workflows/ci.yml` runs ruff, `makemigrations --check`, pytest, lint, vitest, build.

## Known limits
- Open Graph tags are set client-side; link-preview crawlers that do not run JavaScript only see the static defaults in `index.html` (needs SSR/prerender to fix).
- Payments are not implemented (cash only).

## Admin improvements
- Roles: `python manage.py setup_admin_roles` (idempotent; run on every deploy) creates groups **Moderator** (applications, products, reviews), **Support** (orders, returns, users – view), **Marketing** (banners, promo codes, categories), **Auditor** (view-only everywhere incl. audit log). Assign staff to a group in Admin → Groups.
- "CSV ga yuklab olish" action on orders and promo codes (formula-injection safe, Excel-friendly UTF-8).
- Orders: delivery method, contact, courier, promo/discount, filters by method and store; stores: order terms and rating; products: discount and rating columns.
- Dashboard: pending returns, new reviews, top stores (30 days); sidebar icons for the new sections.
