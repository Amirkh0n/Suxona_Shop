import PageHeader from '../components/PageHeader';

const DOCS = {
  shartlar: {
    title: 'Foydalanish shartlari',
    sections: [
      ['Umumiy', "SuxonaShop — mahalliy do'konlar va xaridorlarni bog'lovchi platforma. Ro'yxatdan o'tish orqali siz ushbu shartlarga rozilik bildirasiz."],
      ['Xaridorlar', "Buyurtma berishda to'g'ri telefon raqam va manzil kiriting. Buyurtma sotuvchi tasdiqlagunga qadar bekor qilinishi mumkin. Qaytarish — mahsulot topshirilgandan keyin 7 kun ichida, sotuvchi ko'rib chiqadi."],
      ['Sotuvchilar', "Do'kon ma'lumotlari, narx va zaxira to'g'ri bo'lishi shart. Yangi va o'zgargan mahsulotlar moderatsiyadan o'tadi. Qonunga zid yoki taqiqlangan mahsulotlar sotilmaydi."],
      ['Javobgarlik', "Platforma xaridor va sotuvchi o'rtasidagi kelishuvda vositachi. Mahsulot sifati va yetkazib berish uchun sotuvchi javob beradi."],
    ],
  },
  maxfiylik: {
    title: 'Maxfiylik siyosati',
    sections: [
      ['Qanday ma\'lumot yig\'iladi', "Ism, telefon raqam, yetkazib berish manzili, buyurtmalar tarixi va Telegram identifikatori (bildirishnomalar uchun)."],
      ['Nima uchun ishlatiladi', "Buyurtmalarni bajarish, Telegram orqali xabar yuborish va xavfsizlik uchun. Ma'lumotlar reklama maqsadida uchinchi tomonga sotilmaydi."],
      ['Kimga ko\'rinadi', "Buyurtma berganingizda do'kon egasi ismingiz, telefoningiz va manzilingizni ko'radi — yetkazib berish uchun."],
      ['Sizning huquqlaringiz', "Profil ma'lumotlarini o'zgartirishingiz yoki hisobingizni o'chirishni so'rashingiz mumkin. So'rov Telegram bot yoki platforma administratoriga yuboriladi."],
    ],
  },
};

export default function Legal({ doc }) {
  const d = DOCS[doc];
  return (
    <div className="container page">
      <PageHeader title={d.title} />
      {d.sections.map(([h, p]) => (
        <section key={h} style={{ marginBottom: 'var(--sp-5)' }}>
          <h3 style={{ marginBottom: 4 }}>{h}</h3>
          <p>{p}</p>
        </section>
      ))}
    </div>
  );
}
