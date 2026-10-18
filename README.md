# SuxonaShop

Mahalliy do'konlar uchun marketplace: Django REST backend + React (Vite) frontend + Telegram bot.

## Tezkor ishga tushirish (Docker)

```bash
cp .env.example .env        # qiymatlarni to'ldiring (SECRET_KEY, TELEGRAM_BOT_TOKEN, ...)
docker compose up --build   # backend :8000 + db
docker compose exec backend uv run python manage.py createsuperuser
```

- API hujjatlari: `/api/docs/` · Admin panel: `/admin/`
- Admin: Jazzmin (AdminLTE) + maxsus dashboard (`apps/common/templates/admin/index.html`), sozlamalar `backend/config/settings/jazzmin.py`. Til: `uz`.
- Do'kon arizalarini admin'da ko'rib chiqing: **Stores → Store applications** → ariza ichida *Approve* / *Reject*.

## Telegram bot (webhook)

Bot alohida jarayon emas: Telegram yangilanishlarni `POST /api/v1/telegram/webhook` ga
yuboradi, Django ularni shu so'rov ichida sinxron qayta ishlaydi.

1. `.env`: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET` (tasodifiy uzun qator),
   `SITE_BASE_URL=https://api.sizning-domen.uz`, `FRONTEND_BASE_URL=https://sizning-domen.uz`,
   ixtiyoriy `TELEGRAM_ADMIN_CHAT_ID` (yangi arizalar haqida xabar oladigan chat/guruh).
2. Deploy'dan keyin bir marta: `python manage.py set_telegram_webhook`
   (tekshirish: `telegram_webhook_info`, o'chirish: `delete_telegram_webhook`).
   Telegram faqat **https** manzilga yuboradi; lokal sinov uchun ngrok/cloudflared tunnel ishlating.
3. Xabarnomalar (havola bilan): yangi ariza → admin; ariza tasdiqlandi/rad etildi → ega;
   yangi buyurtma → sotuvchi; buyurtma holati → mijoz; mijoz bekor qilsa → sotuvchi.

## Lokal (Docker'siz)

```bash
cd backend && uv sync && cp .env.example .env   # POSTGRES_HOST=localhost
uv run python manage.py migrate && uv run python manage.py runserver
uv run python manage.py set_telegram_webhook   # https tunnel kerak (ngrok)
uv run pytest
```

Frontend: `cd frontend && npm ci && npm run dev`.

Reja va holat: [docs/IMPROVEMENT_PLAN.md](docs/IMPROVEMENT_PLAN.md).
