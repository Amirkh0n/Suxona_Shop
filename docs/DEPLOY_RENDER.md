# Render'ga deploy (backend) + Cloudflare (frontend)

Backend (Django API + admin) Render'da, Postgres Render'da, rasmlar Cloudflare R2'da,
frontend Cloudflare Pages'da. Hammasi `render.yaml` bilan bir marta sozlanadi.

## 0. Nimalar kerak
- GitHub'da repo (Render shu repodan quradi)
- Telegram bot tokeni (@BotFather)
- Cloudflare R2 bucket (rasmlar uchun) — **majburiy**: Render'da fayl tizimi har deployda tozalanadi

## 1. Cloudflare R2
1. R2 → Create bucket (masalan `suxonashop-media`).
2. Bucket → Settings → **Public access** yoqing (yoki o'z domeningizni ulang) → public URL ni oling.
3. R2 → Manage API tokens → *Object Read & Write* token yarating → `Access Key ID`, `Secret`, `Endpoint` (`https://<account>.r2.cloudflarestorage.com`).

## 2. Render
1. Dashboard → **New → Blueprint** → repoyni tanlang (branch: `main` yoki kerakli branch).
2. Render `render.yaml` ni o'qiydi: `suxonashop-api` (Docker web service) va `suxonashop-db` (Postgres) yaratiladi.
3. So'ralgan qiymatlarni to'ldiring:

| O'zgaruvchi | Qiymat |
|---|---|
| `DJANGO_CORS_ALLOWED_ORIGINS` | Cloudflare sayt manzili, masalan `https://suxonashop.pages.dev` (oxirida `/` yo'q). Bir nechta bo'lsa vergul bilan |
| `FRONTEND_BASE_URL` | Yuqoridagi bilan bir xil |
| `SITE_BASE_URL` | Backendning o'z manzili: `https://suxonashop-api.onrender.com` (deploydan keyin ko'rinadi) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME` | BotFather'dan |
| `TELEGRAM_ADMIN_CHAT_ID` | (ixtiyoriy) yangi arizalar yuboriladigan chat |
| `CLOUDFLARE_R2_*` | 1-bosqichdagi qiymatlar; `CLOUDFLARE_R2_PUBLIC_URL` — public URL |

`DJANGO_SECRET_KEY` va `TELEGRAM_WEBHOOK_SECRET` avtomatik yaratiladi.

4. Birinchi deploy tugagach `SITE_BASE_URL` ni haqiqiy manzilga o'zgartirib, **Manual Deploy** qiling
   (Telegram webhook shu manzilga o'rnatiladi).

Har deployda konteyner o'zi: `migrate` → `setup_admin_roles` → (`SET_TELEGRAM_WEBHOOK=true` bo'lsa) webhook → `gunicorn`.

## 3. Admin foydalanuvchi
Render → `suxonashop-api` → **Shell**:
```
python manage.py createsuperuser
```
(telefon raqam va parol so'raydi.) Keyin `https://<api>/admin/` ga kiring. Staff xodimlarni
Groups (Moderator / Support / Marketing / Auditor) ga qo'shing.

## 4. Cloudflare Pages (frontend)
Build sozlamalari: root `frontend`, build `npm run build`, output `dist`. Environment variables (build vaqtida o'qiladi):

| O'zgaruvchi | Qiymat |
|---|---|
| `VITE_API_BASE_URL` | `https://suxonashop-api.onrender.com` (oxirida `/` yo'q) |
| `VITE_IMAGE_BASE_URL` | R2 public URL |

`frontend/public/_headers` service worker va `index.html` keshlanmasligini ta'minlaydi (deploydan keyin eski versiya qolib ketmaydi).
Env o'zgarsa frontendni qayta build qiling.

## 5. Tekshirish
- `https://<api>/healthz` → `{"status":"ok"}`
- `https://<api>/api/docs/` → Swagger
- Brauzerda frontend ochilib, mahsulotlar yuklanadi (aks holda: CORS qiymatini tekshiring)
- Telegram: bog'langan akkauntga bildirishnoma keladi; `python manage.py telegram_webhook_info` (Shell)

## Lokal (Docker Compose)
```
cp backend/.env.example backend/.env     # DJANGO_SECRET_KEY ni to'ldiring
docker compose up --build
```
API `http://localhost:8000`, admin `/admin/`. R2 sozlanmasa, rasmlar docker volume'ga yoziladi va Django o'zi beradi.
Frontend: `cd frontend && npm run dev` (`VITE_API_BASE_URL=http://localhost:8000`).

## Muhim eslatmalar
- **Free reja:** Render free web service 15 daqiqa ishlatilmasa uxlaydi (birinchi so'rov ~30–60 s); free Postgres 30 kundan keyin o'chadi. Real foydalanish uchun `starter` / `basic-256mb`.
- Telegram webhook uxlab yotgan servisni uyg'otadi, lekin Telegram ~10 s kutadi — free rejada tugmalar ba'zan kech javob beradi.
- `DJANGO_HSTS_SECONDS` ni https hamma joyda ishlashiga ishonch hosil qilgach yoqing.
- `DJANGO_SECRET_KEY` ni o'zgartirsangiz, hamma sessiyalar/tokenlar bekor bo'ladi.
- Zaxira: Render Postgres paid rejalarida avtomatik backup bor; free'da yo'q — `pg_dump` ni o'zingiz oling.
- Persistent disk bilan R2siz ishlash mumkin: disk `/data/media` ga ulang, `DJANGO_MEDIA_ROOT=/data/media`, `DJANGO_SERVE_MEDIA=true` (faqat bitta instance bilan).
