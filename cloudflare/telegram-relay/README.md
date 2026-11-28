# Telegram relay (Cloudflare Worker)

PythonAnywhere (bepul reja) `api.telegram.org` ga proksi orqali chiqa olmasa (`503`), lekin `*.workers.dev` ruxsat etilgan.
Bu Worker backend'dan kelgan so'rovlarni Telegram'ga uzatadi.

## O'rnatish (brauzerda, 3 daqiqa)
1. Cloudflare → **Workers & Pages** → **Create** → **Create Worker** → nom: `suxona-tg-relay` → **Deploy**.
2. **Edit code** → ichidagini o'chirib, `worker.js` mazmunini qo'ying → **Deploy**.
3. **Settings → Variables and Secrets → Add** → turi **Secret**, nom `RELAY_KEY`, qiymat — uzun tasodifiy qator
   (`python -c "import secrets;print(secrets.token_urlsafe(40))"`) → **Deploy**.
4. Worker manzilini oling: `https://suxona-tg-relay.<akkaunt>.workers.dev`.

## Backend `.env`
```
TELEGRAM_API_BASE_URL=https://suxona-tg-relay.<akkaunt>.workers.dev
TELEGRAM_RELAY_KEY=<yuqoridagi RELAY_KEY bilan bir xil>
```
Reload qiling, keyin:
```
python manage.py set_telegram_webhook
python manage.py telegram_webhook_info
```

## Xavfsizlik
- `X-Relay-Key` bo'lmasa Worker `403` qaytaradi, ya'ni boshqalar relay'dan foydalana olmaydi.
- Bot tokeni backend'dan Worker'ga (HTTPS) o'tadi va Cloudflare'da saqlanmaydi. Worker loglarida token ko'rinmasligi uchun
  Observability/Logs'ni yoqmang.
- Webhook (Telegram → backend) relay'siz, to'g'ridan-to'g'ri ishlaydi.
