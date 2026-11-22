# Xavfsizlik

## Audit natijalari (2026-11)
Tekshirilgan: avtorizatsiya (IDOR), autentifikatsiya/sessiya, kiritish xavfsizligi, fayl yuklash, sozlamalar, bog'liqliklar.

| # | Topilma | Xavf | Holat |
|---|---|---|---|
| 1 | Throttle proksi orqasida aldanardi: `X-Forwarded-For` ga o'zboshimcha qiymat yozib limitni aylanib o'tish mumkin edi (`NUM_PROXIES` yo'q) | Yuqori | Tuzatildi (`DJANGO_NUM_PROXIES`, default 1) |
| 2 | Throttle/lock hisoblagichlari har gunicorn worker xotirasida alohida edi (limit worker soniga ko'paygan) | O'rta | Production'da umumiy kesh: Redis yoki DB-kesh (`createcachetable`) |
| 3 | Bitta akkauntga taqsimlangan (ko'p IP) parol tanlash cheklanmagan | Yuqori | Telefon bo'yicha lock: 5 xato → 15 daqiqa (429) |
| 4 | Refresh token qayta ishlatilsa ham ishlayverardi; parol tiklangandan keyin eski sessiyalar yashardi | Yuqori | Rotatsiya + blacklist, `POST /auth/logout`, parol tiklanganda barcha sessiyalar bekor, o'chirilgan foydalanuvchi refresh qila olmaydi |
| 5 | CSV Injection: mahsulot/mijoz nomi `=HYPERLINK(...)` bo'lsa Excel'da formula ishga tushardi | O'rta | `csv_safe` hamma CSV eksportda (admin ham) |
| 6 | Rasm yuklashda hajm/piksel chegarasi yo'q (decompression bomb) | O'rta | `SafeImageField`: 8 MB, 40 Mpx, haqiqiy rasm tekshiruvi (SVG/HTML rad etiladi) |
| 7 | Telegram secret oddiy `!=` bilan solishtirilardi (timing) | Past | `hmac.compare_digest` |
| 8 | Parol siyosati ro'yxatdan o'tish va tiklashda qo'llanmagan ("12345678" o'tardi) | O'rta | Django validatorlari qo'llanadi |
| 9 | Seller promokodida `value > 100%` yoki manfiy qiymat | O'rta | Validatsiya qo'shildi |
| 10 | `SECRET_KEY` uzunligi tekshirilmasdi; admin yo'li `/admin/` qat'iy; browsable API production'da ochiq | Past | ≥32 belgi majburiy; `DJANGO_ADMIN_URL`; production'da faqat JSON; `X_FRAME_OPTIONS=DENY` |
| 11 | npm: 1 ta yuqori zaiflik (transitive) | Yuqori | `npm audit fix` bilan tuzatildi |

Tekshirildi va muammo topilmadi: ob'ekt darajasidagi ruxsatlar (`test_authorization.py` — 100+ ta tekshiruv: begona xaridor/sotuvchi/anonim har bir id-endpoint'ga rad javob oladi), SQL injection (faqat ORM), chop etish varaqasida XSS (hamma maydon escape), OG sahifa, Telegram webhook (secret yo'q bo'lsa 503), CORS (aniq ro'yxat, cookie yo'q), `pip-audit` va `bandit` toza.

## Qolgan xavflar / tavsiyalar
- **Admin 2FA yo'q.** Admin xodimlariga uzun parol bering va `DJANGO_ADMIN_URL` ni maxfiy qiling; keyin `django-otp` qo'shish mumkin.
- **Tokenlar `localStorage` da** (SPA uchun odatiy): XSS bo'lsa o'g'irlanadi. Shuning uchun frontendda `dangerouslySetInnerHTML` ishlatilmaydi va Cloudflare Pages uchun CSP sarlavhasi tavsiya etiladi (`frontend/public/_headers`).
- **Ikki tab refresh poygasi:** rotatsiya tufayli bir vaqtda refresh qilgan ikkinchi tab chiqib ketishi mumkin (qayta kirish kerak).
- **SMS/OTP orqali kirish yo'q** — kod faqat Telegram'ga boradi.
- Zaxira: Postgres backup'larini yoqing; maxfiy kalitlarni (`DJANGO_SECRET_KEY`, R2, bot token) faqat Render env'da saqlang, repoga yozmang.
- Muntazam: CI'dagi `security` job (pip-audit, bandit, npm audit) har PR'da ishlaydi.

## Muammo xabari
Zaiflik topsangiz, ommaviy issue ochmasdan, repo egasiga shaxsiy xabar yuboring.
