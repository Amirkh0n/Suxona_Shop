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
    _notify_user(
        owner,
        templates.store_application_approved(store_name),
        [("Sotuvchi paneli", _app("/sotuvchi"))],
    )


def notify_store_application_rejected(
    *, owner: User, store_name: str, admin_note: str = ""
) -> None:
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


def notify_seller_new_order(*, order_id: int) -> None:
    from apps.orders.models import Order

    order = Order.objects.select_related("store__owner", "customer").get(pk=order_id)
    _notify_user(
        order.store.owner,
        templates.new_order_for_seller(
            order.pk,
            _customer_name(order.customer),
            f"{order.total:,.0f}".replace(",", " "),
            order.items.count(),
        ),
        [("Buyurtmalarni ochish", _app("/sotuvchi/buyurtmalar"))],
    )


def notify_customer_order_status(*, order_id: int) -> None:
    from apps.orders.models import Order

    order = Order.objects.select_related("store", "customer").get(pk=order_id)
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
    _notify_user(
        order.store.owner,
        templates.order_cancelled_for_seller(order.pk, _customer_name(order.customer)),
        [("Buyurtmalarni ochish", _app("/sotuvchi/buyurtmalar"))],
    )
