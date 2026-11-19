"""High-level notification entry points used by other apps' services.

Callers (e.g. ``ApproveStoreService``) never import ``client``/``templates``
or resolve chat ids themselves — that indirection lives here, so a call site is
one readable line and link-building / opt-out logic has a single home.

All functions are synchronous and best-effort: they log instead of raising.
"""

from __future__ import annotations

import logging

from django.conf import settings
from django.db import transaction

from apps.accounts.models import TelegramAccount, User
from apps.notifications.inapp import create_notification
from apps.notifications.telegram import client, templates

logger = logging.getLogger(__name__)


def after_commit(func, /, **kwargs) -> None:
    """Run ``func(**kwargs)`` once the surrounding transaction commits.

    A notification must describe something that really happened, so it is
    deferred until commit (and skipped on rollback). ``robust=True`` makes
    Django log, rather than re-raise, any error inside the callback, so a
    notification bug can never turn a successful request into a 500.
    """
    transaction.on_commit(lambda: func(**kwargs), robust=True)


# -- link builders -------------------------------------------------------------
def _app(path: str) -> str:
    return f"{settings.FRONTEND_BASE_URL}{path}"


def _admin(path: str) -> str:
    return f"{settings.SITE_BASE_URL}/admin/{path}"


def _chat_id_for(user: User) -> str | None:
    account = TelegramAccount.objects.filter(user=user).only("telegram_id").first()
    if account is None:
        # Expected, not an error: a user who verified by some other means
        # (or a legacy/test account) simply has nothing to notify.
        logger.info("No linked Telegram account for user_id=%s; skipping notification.", user.pk)
        return None
    return account.telegram_id


def _notify_user(user: User, text: str, links: list[client.Link] | None = None) -> None:
    chat_id = _chat_id_for(user)
    if chat_id is not None:
        client.send_message(chat_id, text, links=links)


# -- verification --------------------------------------------------------------
def verification_links() -> list[client.Link]:
    return [("SuxonaShop'ga kirish", _app("/kirish"))]


# -- store applications --------------------------------------------------------
def notify_store_application_approved(*, owner: User, store_name: str) -> None:
    create_notification(
        owner, kind="store", title=f"“{store_name}” do'koni tasdiqlandi 🎉", link="/sotuvchi"
    )
    _notify_user(
        owner,
        templates.store_application_approved(store_name),
        [("Sotuvchi paneli", _app("/sotuvchi"))],
    )


def notify_store_application_rejected(
    *, owner: User, store_name: str, admin_note: str = ""
) -> None:
    create_notification(
        owner, kind="store", title=f"“{store_name}” arizasi rad etildi",
        body=admin_note, link="/dokon-ochish",
    )
    _notify_user(
        owner,
        templates.store_application_rejected(store_name, admin_note),
        [("Qayta ariza yuborish", _app("/dokon-ochish"))],
    )


def notify_admins_new_store_application(
    *, store_name: str, owner_phone: str, application_id: int
) -> None:
    admin_chat_id = settings.TELEGRAM_ADMIN_CHAT_ID
    if not admin_chat_id:
        return
    client.send_message(
        admin_chat_id,
        templates.new_store_application_for_admin(store_name, owner_phone),
        links=[
            (
                "Arizani ko'rib chiqish",
                _admin(f"stores/storeapplication/{application_id}/change/"),
            )
        ],
    )


# -- orders --------------------------------------------------------------------
def _customer_name(user: User) -> str:
    return f"{user.first_name} {user.last_name}".strip() or user.phone


def _money(value) -> str:
    return f"{value:,.0f}".replace(",", " ")


# Buttons offered to the seller for each status; (label, action). The action
# names are what bot.handle_update maps back to the order services.
SELLER_ACTIONS: dict[str, list[list[tuple[str, str]]]] = {
    "PENDING": [[("✅ Qabul qilish", "accept"), ("❌ Rad etish", "reject")]],
    "ACCEPTED": [[("🚚 Yetkazishga chiqarish", "deliver")], [("🚫 Bekor qilish", "cancel")]],
    "DELIVERING": [[("🎉 Yakunlash", "complete")]],
}


def seller_order_view(order) -> tuple[str, list[list[client.Action]], list[client.Link]]:
    """Text + buttons for the seller's order message, for the order's *current* status.

    Used for the first message and to re-render it after every button tap, so
    the chat always shows the real state (and stale buttons disappear).
    """
    items = [
        f"{i.product.name}"
        f"{' (' + _variant_text(i.variant) + ')' if i.variant else ''}"
        f" × {i.quantity} — {_money(i.subtotal)}"
        for i in order.items.select_related("product", "variant")
    ]
    address = order.address
    if address is None:
        address_text = "Olib ketish (do'kondan)"
    else:
        address_text = f"{address.village.name}, {address.street}, {address.house}"
    text = templates.seller_order_card(
        order_id=order.pk,
        status=order.status,
        customer=order.contact_name or _customer_name(order.customer),
        phone=order.contact_phone or order.customer.phone,
        address=address_text,
        items=items,
        delivery=(
            "olib ketish" if address is None else f"{_money(order.delivery_price)} so'm"
        ),
        note=order.note,
        total=_money(order.total),
    )
    actions = [
        [(label, f"order:{action}:{order.pk}") for label, action in row]
        for row in SELLER_ACTIONS.get(order.status, [])
    ]
    links = [("Buyurtmani ochish", _app(f"/buyurtma/{order.pk}"))]
    return text, actions, links


def _variant_text(variant) -> str:
    attrs = " · ".join(f"{k}: {v}" for k, v in (variant.attributes or {}).items() if v)
    return attrs or variant.sku


def notify_seller_new_order(*, order_id: int) -> None:
    from apps.orders.models import Order

    order = Order.objects.select_related(
        "store__owner", "customer", "address__village"
    ).get(pk=order_id)
    create_notification(
        order.store.owner, kind="order", title=f"Yangi buyurtma #{order.pk}",
        body=f"Jami: {_money(order.total)} so'm", link=f"/buyurtma/{order.pk}",
    )
    chat_id = _chat_id_for(order.store.owner)
    if chat_id is None:
        return
    text, actions, links = seller_order_view(order)
    client.send_message(chat_id, text, links=links, actions=actions)


def notify_customer_order_status(*, order_id: int) -> None:
    from apps.orders.models import Order

    order = Order.objects.select_related("store", "customer").get(pk=order_id)
    create_notification(
        order.customer, kind="order",
        title=(
            f"Buyurtma #{order.pk}: "
            f"{templates.ORDER_CARD_STATUS.get(order.status, order.status)}"
        ),
        body=order.note if order.status == "REJECTED" else order.store.name,
        link=f"/buyurtma/{order.pk}",
    )
    _notify_user(
        order.customer,
        templates.order_status_for_customer(
            order.pk, order.store.name, order.status, order.note
        ),
        [("Buyurtmani ko'rish", _app(f"/buyurtma/{order.pk}"))],
    )


def notify_seller_order_cancelled(*, order_id: int) -> None:
    from apps.orders.models import Order

    order = Order.objects.select_related("store__owner", "customer").get(pk=order_id)
    create_notification(
        order.store.owner, kind="order", title=f"Buyurtma #{order.pk} bekor qilindi",
        body=_customer_name(order.customer), link=f"/buyurtma/{order.pk}",
    )
    _notify_user(
        order.store.owner,
        templates.order_cancelled_for_seller(order.pk, _customer_name(order.customer)),
        [("Buyurtmalarni ochish", _app("/sotuvchi/buyurtmalar"))],
    )


# -- product moderation --------------------------------------------------------
def notify_admins_product_review(*, product_id: int) -> None:
    from apps.products.models import Product

    admin_chat_id = settings.TELEGRAM_ADMIN_CHAT_ID
    if not admin_chat_id:
        return
    product = Product.objects.select_related("store").get(pk=product_id)
    client.send_message(
        admin_chat_id,
        templates.new_product_for_review(product.name, product.store.name),
        links=[("Mahsulotni ko'rib chiqish", _admin(f"products/product/{product.pk}/change/"))],
    )


def notify_seller_product_moderated(*, product_id: int) -> None:
    from apps.common.enums import ProductStatus
    from apps.products.models import Product

    product = Product.objects.select_related("store__owner").get(pk=product_id)
    if product.status == ProductStatus.ACTIVE:
        text = templates.product_approved(product.name)
    else:
        text = templates.product_rejected(product.name, product.moderation_note)
    create_notification(
        product.store.owner, kind="product",
        title=(
            f"“{product.name}” tasdiqlandi"
            if product.status == ProductStatus.ACTIVE
            else f"“{product.name}” rad etildi"
        ),
        body=product.moderation_note, link=f"/sotuvchi/mahsulotlar/{product.pk}",
    )
    _notify_user(
        product.store.owner,
        text,
        [("Mahsulotni ochish", _app(f"/sotuvchi/mahsulotlar/{product.pk}"))],
    )
