# PythonAnywhere'ga deploy (backend)

> Faqat backend. Frontend Cloudflare Pages'da. PythonAnywhere free rejasida tashqariga faqat ruxsat etilgan ro'yxatdagi
> saytlarga proksi orqali chiqiladi. `api.telegram.org` ro'yxatda bo'lsa ham ba'zi akkauntlarda proksi `503` qaytaradi —
> unda `cloudflare/telegram-relay` (Cloudflare Worker) orqali yuboring (5-bo'lim).

## 1. Kod va muhit (Bash console)
```bash
cd ~ && git clone https://github.com/Amirkh0n/Suxona_Shop.git && cd Suxona_Shop/backend
python3.12 -m venv ~/venv && source ~/venv/bin/activate     # Python 3.12 bo'lishi kerak
pip install -r requirements/production.txt
cp .env.example .env && nano .env
```
`.env` da kamida:
```
DJANGO_SETTINGS_MODULE=config.settings.production
DJANGO_SECRET_KEY=<python -c "import secrets;print(secrets.token_urlsafe(50))">
DJANGO_ALLOWED_HOSTS=<username>.pythonanywhere.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://<username>.pythonanywhere.com
DJANGO_CORS_ALLOWED_ORIGINS=https://<sizning-saytingiz>.pages.dev
SITE_BASE_URL=https://<username>.pythonanywhere.com
FRONTEND_BASE_URL=https://<sizning-saytingiz>.pages.dev
DJANGO_CACHE_BACKEND=file
DJANGO_LOG_FILE=/home/<username>/suxona-errors.log
DJANGO_MEDIA_ROOT=/home/<username>/media
DJANGO_NUM_PROXIES=1
TELEGRAM_BOT_TOKEN=...
TELEGRAM_BOT_USERNAME=...
TELEGRAM_WEBHOOK_SECRET=<uzun tasodifiy qator>
```
Ma'lumotlar bazasi: hech narsa yozmasangiz SQLite (`backend/db.sqlite3`) ishlatiladi — PythonAnywhere'da bu yetarli.

## 2. Bir martalik buyruqlar
```bash
export DJANGO_SETTINGS_MODULE=config.settings.production
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py setup_admin_roles
python manage.py createsuperuser
mkdir -p ~/media
```
(Agar `DJANGO_CACHE_BACKEND` ni bermasangiz: `python manage.py createcachetable`.)

## 3. Web tab
- **Source code / Working directory:** `/home/<username>/Suxona_Shop/backend`
- **Virtualenv:** `/home/<username>/venv`
- **WSGI fayl** (Web tab → WSGI configuration file) to'liq shunday bo'lsin:
```python
import os, sys
from dotenv import load_dotenv

path = "/home/<username>/Suxona_Shop/backend"
if path not in sys.path:
    sys.path.insert(0, path)
load_dotenv(os.path.join(path, ".env"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```
- **Static files:** `/static/` → `/home/<username>/Suxona_Shop/backend/staticfiles`; `/media/` → `/home/<username>/media`
- **Force HTTPS:** yoqing. Keyin **Reload**.

## 4. 500 xato bo'lsa — xatoni ko'rish
1. `~/suxona-errors.log` (yuqoridagi `DJANGO_LOG_FILE`), keyin Web tab → **Error log** va **Server log**.
2. Hech narsa ko'rinmasa, Bash'da to'liq xatoni chiqaring:
```bash
cd ~/Suxona_Shop/backend && source ~/venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings.production
python manage.py check --deploy
python - <<'PY'
import django; django.setup()
from django.test import Client
c = Client()
r = c.get("/api/v1/stores", HTTP_HOST="<username>.pythonanywhere.com", secure=True)
print(r.status_code, r.content[:300])
PY
```
Test klient xatoni to'liq traceback bilan ko'rsatadi.

Eng ko'p uchraydigan sabablar: `migrate` bajarilmagan (jadval yo'q); kesh jadvali yo'q (`createcachetable` yoki `DJANGO_CACHE_BACKEND=file`);
`collectstatic` bajarilmagan; `.env` WSGI faylda yuklanmagan; `DJANGO_SECRET_KEY` 32 belgidan qisqa.

## 5. Telegram webhook
`SITE_BASE_URL` to'g'ri bo'lgach: `python manage.py set_telegram_webhook`.

**`Tunnel connection failed: 503` chiqsa** (`curl https://api.telegram.org/bot<TOKEN>/getMe` ham shuni bersa) — server Telegram'ga
chiqa olmayapti. `*.workers.dev` ruxsat etilgan, shuning uchun `cloudflare/telegram-relay/README.md` bo'yicha relay o'rnating va `.env` ga
`TELEGRAM_API_BASE_URL` va `TELEGRAM_RELAY_KEY` ni yozing.
Free reja: web app 3 oyda bir marta "Run until" tugmasini bosib uzaytirilishi kerak.
