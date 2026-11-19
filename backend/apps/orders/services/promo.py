from decimal import Decimal

from apps.accounts.models import User
from apps.common.enums import OrderStatus
from apps.orders.exceptions import InvalidPromoCodeError
from apps.orders.models import Order, PromoCode
from apps.stores.models import Store


def validate_promo(
    *, code: str, store: Store, customer: User, subtotal: Decimal, lock: bool = False
) -> tuple[PromoCode, Decimal]:
    """Return ``(promo, discount)`` or raise ``InvalidPromoCodeError`` with a user-facing reason.

    ``lock=True`` row-locks the promo (use inside the order transaction so the
    usage limit cannot be exceeded by concurrent checkouts).
    """
    qs = PromoCode.objects.select_for_update() if lock else PromoCode.objects
    promo = qs.filter(code=code.strip().upper()).first()
    if promo is None or not promo.is_live():
        raise InvalidPromoCodeError("Promokod topilmadi yoki muddati tugagan.")
    if promo.store_id is not None and promo.store_id != store.pk:
        raise InvalidPromoCodeError("Bu promokod ushbu do'kon uchun amal qilmaydi.")
    if subtotal < promo.min_order_amount:
        raise InvalidPromoCodeError(
            f"Promokod uchun minimal buyurtma {promo.min_order_amount:,.0f} so'm.".replace(",", " ")
        )
    already = (
        Order.objects.filter(customer=customer, promo_code=promo)
        .exclude(status__in=[OrderStatus.CANCELLED, OrderStatus.REJECTED])
        .exists()
    )
    if already:
        raise InvalidPromoCodeError("Siz bu promokodni allaqachon ishlatgansiz.")
    return promo, promo.discount_for(subtotal)
