"""Message text builders for the Telegram bot (HTML parse mode).

Every dynamic value that can contain user input (store names, notes, names)
goes through ``esc`` — otherwise a store called ``<b>`` or ``a & b`` would make
Telegram reject the message ("can't parse entities") or inject markup.
"""

from __future__ import annotations

from html import escape


def esc(value: object) -> str:
    # Telegram HTML only needs < > & escaped; quotes are fine in text nodes.
    return escape(str(value), quote=False)


ORDER_STATUS_LABELS = {
    "ACCEPTED": "✅ qabul qilindi",
    "DELIVERING": "🚚 yetkazilmoqda",
    "COMPLETED": "🎉 yetkazib berildi",
    "REJECTED": "❌ do'kon tomonidan rad etildi",
    "CANCELLED": "🚫 bekor qilindi",
}


# -- verification / onboarding -------------------------------------------------
def verification_success() -> str:
    return (
        "✅ <b>Telefon raqamingiz tasdiqlandi!</b>\n\n"
        "Endi SuxonaShop ilovasiga kirishingiz mumkin."
    )


def verification_invalid_or_expired() -> str:
    return (
        "❌ Havola yaroqsiz yoki muddati o'tgan.\n\n"
        "Iltimos, ilovada qaytadan ro'yxatdan o'ting va yangi havoladan "
        "foydalaning."
    )


def verification_telegram_already_linked() -> str:
    return (
        "⚠️ Bu Telegram akkaunti allaqachon boshqa foydalanuvchiga "
        "bog'langan.\n\nYordam uchun administratorga murojaat qiling."
    )


def welcome_no_token() -> str:
    return (
        "👋 Salom! Men <b>SuxonaShop</b> botiman.\n\n"
        "Ro'yxatdan o'tish uchun avval ilovada telefon raqamingiz bilan "
        "ro'yxatdan o'ting — sizga shu yerga qaytib kelish uchun maxsus "
        "havola beriladi."
    )


# -- store applications --------------------------------------------------------
def store_application_approved(store_name: str) -> str:
    return (
        "🎉 <b>Tabriklaymiz!</b>\n\n"
        f"«{esc(store_name)}» do'koningiz tasdiqlandi va endi SuxonaShop'da "
        "faol holatda. Sotuvchi panelidan mahsulot qo'shishni boshlashingiz mumkin."
    )


def store_application_rejected(store_name: str, admin_note: str) -> str:
    text = f"😔 «{esc(store_name)}» nomli do'kon arizangiz rad etildi."
    if admin_note:
        text += f"\n\n<b>Sabab:</b> {esc(admin_note)}"
    text += "\n\nMa'lumotlarni to'g'rilab, qayta ariza yuborishingiz mumkin."
    return text


def new_store_application_for_admin(store_name: str, owner_phone: str) -> str:
    return (
        "🆕 <b>Yangi do'kon arizasi</b>\n\n"
        f"Do'kon: «{esc(store_name)}»\n"
        f"Ega: {esc(owner_phone)}\n\n"
        "Ko'rib chiqish uchun admin panelni oching."
    )


# -- orders --------------------------------------------------------------------
def new_order_for_seller(order_id: int, customer_name: str, total: str, items_count: int) -> str:
    return (
        f"🛒 <b>Yangi buyurtma #{order_id}</b>\n\n"
        f"Mijoz: {esc(customer_name)}\n"
        f"Mahsulotlar: {items_count} ta\n"
        f"Jami: {esc(total)} so'm\n\n"
        "Iltimos, buyurtmani qabul qiling yoki rad eting."
    )


def order_status_for_customer(order_id: int, store_name: str, status: str, note: str = "") -> str:
    label = ORDER_STATUS_LABELS.get(status, status)
    text = f"📦 <b>Buyurtma #{order_id}</b> («{esc(store_name)}») {label}."
    if status == "REJECTED" and note:
        text += f"\n\n<b>Sabab:</b> {esc(note)}"
    return text


def order_cancelled_for_seller(order_id: int, customer_name: str) -> str:
    return f"🚫 <b>Buyurtma #{order_id}</b> mijoz ({esc(customer_name)}) tomonidan bekor qilindi."
