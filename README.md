# SuxonaShop

Mahalliy do'konlar uchun marketplace: Django REST backend + React (Vite) frontend + Telegram bot.

## Tezkor ishga tushirish (Docker)

```bash
cp .env.example .env        # qiymatlarni to'ldiring (SECRET_KEY, TELEGRAM_BOT_TOKEN, ...)
docker compose up --build   # backend :8000, db, bot
docker compose exec backend uv run python manage.py createsuperuser
```

- API hujjatlari: `/api/docs/` · Admin panel: `/admin/`
- Do'kon arizalarini admin'da ko'rib chiqing: **Stores → Store applications** → ariza ichida *Approve* / *Reject*.
- Bot: `docker compose` ichidagi `bot` servisi `manage.py run_telegram_bot` ni ishga tushiradi.

## Lokal (Docker'siz)

```bash
cd backend && uv sync && cp .env.example .env   # POSTGRES_HOST=localhost
uv run python manage.py migrate && uv run python manage.py runserver
uv run python manage.py run_telegram_bot        # alohida terminalda
uv run pytest
```

Frontend: `cd frontend && npm ci && npm run dev`.

Reja va holat: [docs/IMPROVEMENT_PLAN.md](docs/IMPROVEMENT_PLAN.md).
