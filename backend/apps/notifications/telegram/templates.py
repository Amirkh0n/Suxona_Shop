"""Message text builders for the Telegram bot.

Kept separate from services.py so copy changes never touch send logic, and
so the same strings are reusable from both the bot's command handlers and
the admin-triggered service notifications.
"""

from __future__ import annotations


def verification_success(store_name: str | None = None) -> str:
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


def store_application_approved(store_name: str) -> str:
    return (
        f"🎉 <b>Tabriklaymiz!</b>\n\n"
        f"«{store_name}» do'koningiz tasdiqlandi va endi SuxonaShop'da "
        f"faol holatda. Sotuvchi panelidan mahsulot qo'shishni "
        f"boshlashingiz mumkin."
    )


def store_application_rejected(store_name: str, admin_note: str) -> str:
    text = f"😔 «{store_name}» nomli do'kon arizangiz rad etildi."
    if admin_note:
        text += f"\n\n<b>Sabab:</b> {admin_note}"
    text += "\n\nSavollar bo'lsa, administratsiya bilan bog'laning."
    return text


def new_store_application_for_admin(store_name: str, owner_phone: str) -> str:
    return (
        f"🆕 <b>Yangi do'kon arizasi</b>\n\n"
        f"Do'kon: «{store_name}»\n"
        f"Ega: {owner_phone}\n\n"
        f"Ko'rib chiqish uchun admin panelga o'ting."
    )
