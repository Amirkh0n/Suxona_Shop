# SuxonaShop — Frontend (React + Vite)

Backend `schema.yml` (OpenAPI) asosida qurilgan, mobil-first marketplace frontend.
Dizayn yo'nalishi: yashil aksentli (`#16A34A`), minimal, karta-asosli — pastki tab bar
bilan native-ilova uslubidagi xaridor tajribasi + alohida sotuvchi (seller) paneli.

## Ishga tushirish

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL ni backend manzilingizga moslang
npm run dev
```

## Qamrab olingan qism

### Xaridor (mobil-first, pastki tab bar bilan)
- **Auth** — ro'yxatdan o'tish (+ Telegram orqali faollashtirish havolasi), kirish, JWT
- **Bosh sahifa** — bannerlar, kategoriya chiplari, tavsiya etilgan do'konlar, yangi mahsulotlar
- **Katalog** (`/katalog`) — faqat kategoriyalar daraxti: ota-kategoriyalar
  ro'yxati, har birini `>` tugmasi bilan ichma-ich ochib (child/sub-child)
  ko'rish mumkin. Kategoriya nomiga bosilsa mahsulotlar sahifasiga o'tadi.
- **Mahsulotlar** (`/mahsulotlar`) — qidiruv, do'kon bo'yicha filtr, saralash
  (narx/nom). Kategoriyadan kirilganda — agar o'sha kategoriyaning
  pastki (child) kategoriyalari bo'lsa, ularning barcha mahsulotlari ham
  shu yerda birgalikda ko'rsatiladi (bir nechta so'rov parallel yuborilib,
  natijalar birlashtiriladi, chunki backend bitta so'rovda faqat bitta
  aniq kategoriya ID bo'yicha filtrlaydi).
- **Mahsulot sahifasi** — galereya, do'kon havolasi, savatga qo'shish (sticky CTA)
- **Savat** — do'kon bo'yicha guruhlangan, miqdorni o'zgartirish
- **Buyurtma berish** — 2 bosqichli (manzil tanlash → ko'rib chiqish/tasdiqlash), muvaffaqiyat sahifasi
- **Buyurtmalarim** — holat bo'yicha filtrlanadigan ro'yxat, buyurtma tafsiloti
- **Profil** — manzillar CRUD, "do'kon ochish" arizasi

### Sotuvchi paneli (`/sotuvchi`, yon panelli dashboard)
- **Bosh sahifa** — haqiqiy backend ma'lumotlaridan hisoblangan statistika (bugungi/jami
  buyurtmalar va savdo, mahsulotlar soni) + so'nggi buyurtmalar
- **Mahsulotlar** — ro'yxat, yaratish/tahrirlash formasi, rasm yuklash va o'chirish
- **Buyurtmalar** — holat bo'yicha tablar, qabul qilish/rad etish/yetkazishga chiqarish/yakunlash
- **Sozlamalar** — do'kon profili (nom, tavsif, telefon, Telegram) + yetkazib berish
  zonalari (qishloq bo'yicha narx qo'shish/o'chirish)

Buyurtma tafsiloti sahifasi (`/buyurtma/:id`) xaridor va sotuvchi uchun umumiy — kim
ekanligi (`myStore` orqali) aniqlanib, tegishli amallar ko'rsatiladi.

## Production-tayyorlik uchun qo'shilgan yaxshilanishlar

Dastlabki versiyadan keyin, real loyiha sifatida qo'yilishi uchun quyidagilar qo'shildi:

- **Pastki tab bar endi haqiqatan "fixed"** — `.app-shell`da ilgari
  `transform: translateZ(0)` bor edi (desktopda 480px ramkani markazlashtirib,
  undagi `position: fixed` elementlarni ham shu ramkaga bog'lab turish uchun).
  Lekin bu yon-ta'sir sifatida vertikal joylashuvni ham buzgan edi:
  `.app-shell`ning balandligi qattiq emas (kontent bilan o'sadi), shu sabab
  "fixed, bottom: 0" endi ekran tagiga emas, balki shu o'sib ketgan
  qutichaning tagiga yopishib qolardi — mahsulotlar ko'p bo'lganda tab bar
  butun sahifa oxirigacha pastga "tushib ketgandek" ko'rinar edi. Endi tab
  bar, mahsulot sahifasidagi "Savatga qo'shish" paneli, savat va checkout
  pastki panellari haqiqiy brauzer oynasiga (`position: fixed` + `left: 50%;
  transform: translateX(-50%); max-width: 480px`) bog'langan — desktopda
  ko'rinishi bir xil qoladi, lekin endi sahifa qanchalik uzun bo'lmasin,
  doim ekran tagida qotib turadi.
- **Xatolikdan himoya** — `ErrorBoundary` butun ilovani o'raydi, shunda bitta
  komponent xato bersa, foydalanuvchi oq ekran o'rniga tushunarli xabar ko'radi.
- **Code-splitting** — sotuvchi paneli (`/sotuvchi/*`) `React.lazy` orqali alohida
  bundle sifatida yuklanadi, xaridor birinchi marta ochganda bu kodni yuklamaydi
  (`npm run build` natijasida `Dashboard-*.js`, `Settings-*.js` va h.k. alohida
  fayllar ko'rinadi).
- **Custom tasdiqlash oynasi** (`ConfirmDialog`) — native `window.confirm()`
  o'rniga dizaynga mos pill-tugmali modal; manzil va yetkazib berish zonasini
  o'chirishda ishlatiladi.
- **Skeleton loader'lar** — katalog, bosh sahifa, do'kon sahifasi, buyurtmalar
  ro'yxati endi spinner emas, balki kontent shakliga mos skeleton ko'rsatadi.
- **Qidiruv debounce + dropdown'larni yopish** — katalogdagi qidiruv endi har
  harfda emas, 400ms kutib so'rov yuboradi; saralash/do'kon filtr panellari
  tashqariga bosilganda yoki Escape bosilganda avtomatik yopiladi.
- **Sotuvchi: do'kon logotipi/banner yuklash** — `Settings.jsx`da endi UI bor
  (`PatchedStoreUpdate`dagi `logo`/`banner` multipart maydonlari ilgari backendda
  bor edi, lekin frontendda formasi yo'q edi).
- **Sotuvchi: mahsulot rasmlarini sudrab tartiblash** — `productApi.reorderImages`
  endpointi ilgari yozilgan, lekin UI yo'q edi; endi drag-and-drop bilan ishlaydi
  (sichqoncha bilan — HTML5 drag API cheklovi tufayli sensorli ekranda hozircha
  ishlamaydi).
- **Checkout'da zaxira (stock) qayta tekshiruvi** — "Davom etish" va "Buyurtmani
  tasdiqlash" bosilganda savatdagi mahsulotlar qayta so'raladi; agar kimdir
  shu orada mahsulotni sotib ulgurgan bo'lsa, backend rad etishini kutmasdan
  aniq xabar beriladi ("X" mahsulotidan faqat N dona qoldi).
- **Qorong'i rejim (dark mode)** — Profil sahifasidagi tugma orqali
  yoqiladi/o'chiriladi va tanlov `localStorage`da saqlanadi; shuningdek OS
  darajasidagi `prefers-color-scheme: dark` ham avtomatik qo'llab-quvvatlanadi.
- **PWA asoslari** — `manifest.json`, brendga mos ikonkalar (`icon-192.png`,
  `icon-512.png`, `apple-touch-icon.png`) qo'shildi, shuning uchun ilovani
  telefon ekraniga "qo'shish" mumkin. **Eslatma:** service worker (offline
  ishlash, keshlash) qo'shilmagan — bu alohida, ancha katta ish bo'lgani
  uchun hozircha chetlab o'tildi.
- **Rasm manzillarini to'g'ri hal qilish** — API `product.primary_image.image`,
  `store.logo`, `store.banner`, `banner.image`, `category.icon` kabi
  maydonlarda to'liq URL emas, faqat yo'l qaytaradi (masalan
  `/media/products/12.jpg`). Bu ilgari frontendda hal qilinmagan edi — brauzer
  bunday nisbiy manzilni frontend ishlab turgan domenga nisbatan ochishga
  urinib, rasm topilmay qolardi. Endi `src/utils/media.js`dagi
  `resolveImageUrl()` barcha rasm manzillarini `.env`dagi
  `VITE_IMAGE_BASE_URL` (bo'sh bo'lsa `VITE_API_BASE_URL`) bilan to'ldiradi.
  Rasmlar kelajakda Cloudflare R2 yoki boshqa CDN/bucket'ga ko'chirilsa, faqat
  shu environment o'zgaruvchisini R2 bucket manzili bilan almashtirish kifoya —
  kodda hech narsa o'zgartirilmaydi. Agar backend kelajakda allaqachon to'liq
  URL (`https://...`) qaytara boshlasa, funksiya buni ham avtomatik aniqlab,
  o'zgartirmasdan qaytaradi.
- **Katalog qayta qurildi (faqat kategoriyalar daraxti)** — ilgari `/katalog`
  ham qidiruv, ham mahsulot ro'yxatini ko'rsatardi, Bosh sahifadagi qidiruv
  bilan birga ikkita qidiruv maydoni chiqib qolgan edi. Endi: `/katalog` —
  faqat kategoriyalar daraxti (`src/pages/customer/Catalog.jsx`, ichma-ich
  ochiladigan child/sub-child'lar bilan), `/mahsulotlar` — haqiqiy mahsulot
  ro'yxati sahifasi (o'z qidiruv maydonisiz, Bosh sahifa headeridagi yagona
  qidiruv shu sahifaga `?search=` orqali yo'naltiradi). Kategoriya
  nomi bosilganda, agar u pastki kategoriyalarga ega bo'lsa, o'sha
  kategoriya + barcha avlodlarining mahsulotlari birgalikda ko'rsatiladi
  (`src/utils/categoryTree.js`). Shuningdek, `/categories` sahifalangan
  endpoint ekanligi uchun ilgari faqat 1-sahifa kategoriyalari olinardi —
  shu sabab child kategoriyalar ko'rinmas edi; endi barcha sahifalar oxirigacha
  yig'ib olinadi.
- **Bosh sahifadagi kategoriya ikonkalari** — doira ichida kvadrat rasm
  bo'lib qolayotgan edi (`object-fit: contain` 24×24 o'lchamda, doira esa
  56×56 — fon rangi atrofida qolib ketardi). Endi rasm doirani to'liq
  qoplaydi (`object-fit: cover`, 100%×100%, `overflow: hidden`).
- **Loyiha logotipi (ikki xil variantda)** — foydalanuvchi yuklagan `S`
  harfli barg logotipidan endi ikkita alohida asset ishlatiladi:
  - **Ilova ichida** (yuqori bar, sotuvchi paneli sайдбари, kirish sahifasi)
    — `src/assets/logo.png`: orqa fonsiz (shaffof), asl rangli logotip.
    `Header.jsx`, `SellerLayout.jsx` va `Login.jsx`dagi matnli "S"
    belgisi (`.app-logo-mark`) shu rasmga almashtirildi.
  - **PWA/favicon uchun** — foydalanuvchi logoning ikkinchi, oq konturli
    versiyasini yubordi (birinchi versiyada fon ham, logo ham yashil
    bo'lgani uchun PWA ikonkada kontrast yo'q edi). Shu versiyadan fon
    olib tashlanib (asl fon — ko'k-yashil/teal rang edi), o'rniga brend
    rangi `#16A34A` qo'yildi: `favicon.ico` (16/32/48px), `favicon.png`
    (32×32), `icon-192.png`/`icon-512.png` (shaffof fon, PWA "any"
    maqsadi — oq kontur tufayli istalgan fonga mos keladi),
    `icon-192-maskable.png`/`icon-512-maskable.png` (xavfsiz zonaga mos
    qo'shimcha hoshiya + yashil fon bilan to'liq to'ldirilgan, oq kontur
    endi logoni fondan aniq ajratib turadi) va `apple-touch-icon.png`
    (180×180, yashil fon bilan — iOS shaffoflikni qora rangga aylantiradi).
  - Eski `favicon.svg` va ishlatilmayotgan `icons.svg` o'chirilgan edi;
    `manifest.json` va `index.html` shu fayllarga mos.
- **"SuxonaShop" yozuvi** — yuqori bar va sotuvchi panelidagi nom endi 2px
  kattaroq (`--fs-md` 17px o'rniga 19px, faqat shu joyda — umumiy tokenni
  o'zgartirmadik, chunki u narx va h3 kabi boshqa joylarda ham ishlatiladi)
  va "Shop" qismi brend yashil rangida (`.app-logo-accent`).
- **Qorong'i rejimda "Qorong'i rejim" yozuvi qop-qora bo'lib qolayotgan
  edi** — sabab: brauzerlar `<button>`, `<input>` kabi forma elementlariga
  matn rangini avtomatik meros qilib bermaydi (faqat shrift oilasi/o'lchamini
  beradi), shu uchun profil sahifasidagi tungi rejim tugmasi (u oddiy matn
  kabi ko'rinadigan `<button>`) qorong'i rejimda ham brauzerning standart
  qora rangida qolib ketardi. `button, input, select, textarea`ga
  `color: inherit` qo'shilib, global tuzatildi — bu xuddi shu sababdan
  kelib chiqishi mumkin bo'lgan boshqa joylardagi (masalan, input matni)
  shunga o'xshash muammolarning oldini ham oladi.
- **Qidiruv input ichidagi lupa belgisi** — `left: 14px`dan `left: 18px`ga
  ko'chirildi (matn boshlanishi hali ham 42px padding ichida, bosilib
  qolmaydi).

## Nima UI-only (backendga ulanmagan)

`schema.yml`da yo'q, lekin taqdim etilgan dizaynda ko'rsatilgan funksiyalar ataylab
**vizual ko'rinishda saqlangan, lekin ishlamaydi** — bosilganda buni ochiq aytib turadi
(pastki toast orqali), hech narsani sun'iy ishlayotgandek ko'rsatmaydi:

- Mahsulot rang/o'lcham tanlovi (buyurtmaga ta'sir qilmaydi — mahsulot sahifasida ogohlantirish bor)
- Sevimlilar (yurak belgisi) — faqat shu brauzerda `localStorage`da saqlanadi, serverga yozilmaydi
- Reyting/sharhlar — "Reyting yo'q" deb ko'rsatiladi (API'da review modeli yo'q)
- Katalogdagi "Filtr" tugmasi (narx/o'lcham bo'yicha) — "Saralash" va "Do'kon" filtrlari real ishlaydi
- Sotuvchi panelidagi "Mijozlar" va "Statistika" bo'limlari

## Muhim eslatmalar (schema.yml bilan ishlaganda)

1. `AddressList` javobida `village` — oddiy integer ID (AddressDetail'dagi kabi to'liq
   obyekt emas); frontend buni qishloqlar ro'yxati bilan ID orqali bog'laydi.
2. `/auth/refresh` endpointi yo'q — 401 kelganda foydalanuvchi qayta login qilishga
   yo'naltiriladi.
3. Buyurtma yaratishda (`OrderCreate`) yetkazib berish usuli tanlanmaydi — faqat
   `store_id` + `address_id` + izoh yuboriladi; narx backend tomonidan manzil
   qishlog'iga mos yetkazib berish zonasidan hisoblanadi. Checkout sahifasida
   ko'rsatilgan narx — agar zona topilsa shu zonadan olingan **taxminiy** ko'rsatkich.
4. Mahsulot rasm yuklash (`ProductImageUpload`) schema'da `image: string (format: uri)`
   deb ko'rsatilgan bo'lsa-da, amalda `multipart/form-data` orqali haqiqiy fayl
   yuboriladi (drf-spectacular'ning odatiy xatti-harakati).
5. Sotuvchi dashboard statistikasida "foyda" ko'rsatkichi yo'q — backend'da mahsulot
   tannarxi (cost) ma'lumoti yo'q, shuning uchun soxta raqam ko'rsatilmaydi.

## Papka tuzilishi

```
src/
  api/              axios client + barcha endpoint funksiyalari
  context/          AuthContext, CartContext, FavoritesContext, PreviewNoticeContext
  components/       Header, BottomTabBar, PageHeader, ProductCard, StoreCard, Icons...
  pages/customer/   xaridor sahifalari
  pages/seller/     sotuvchi paneli sahifalari
  pages/            umumiy (404)
  styles/           dizayn tokenlari (ranglar, tipografika, bo'shliqlar)
```
