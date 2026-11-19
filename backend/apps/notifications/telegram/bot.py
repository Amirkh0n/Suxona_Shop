"""Telegram update handling (synchronous).

``handle_update`` is a pure function of one Telegram ``update`` dict. It is
called from the webhook view, in-request: Telegram POSTs an update, we handle
it with blocking calls and answer 200. No polling loop, no event loop.

Supported:
* ``/start verify_<token>`` – completes registration verification by calling
  ``VerifyTelegramRegistrationService`` directly (no HTTP self-call).
* ``/start`` – friendly welcome.
* ``callback_query`` – a seller tapping an inline button on an order message
  (accept / reject / deliver / complete / cancel). The tap is authorised by
  mapping the Telegram sender to a user and checking they own the order's
  store - ``callback_data`` alone is never trusted. The actions go through the
  same services (and state machine) as the web panel, then the message is
  re-rendered in place.
"""

from __future__ import annotations

import logging

from apps.accounts.exceptions import (
    InvalidVerificationTokenError,
    TelegramAlreadyLinkedError,
    VerificationExpiredError,
)
from apps.accounts.services.verify_telegram_registration import (
    VerifyTelegramRegistrationService,
)
from apps.notifications.telegram import client, templates
from apps.notifications.telegram.services import verification_links

logger = logging.getLogger(__name__)

VERIFY_PREFIX = "verify_"


def handle_update(update: dict) -> None:
    if update.get("callback_query"):
        _handle_callback(update["callback_query"])
        return

    message = update.get("message") or {}
    text = (message.get("text") or "").strip()
    sender = message.get("from") or {}
    chat_id = (message.get("chat") or {}).get("id")
    if not text or chat_id is None:
        return

    if not text.startswith("/start"):
        return

    payload = text[len("/start") :].strip()
    if payload.startswith(VERIFY_PREFIX):
        _handle_verification(
            chat_id=chat_id,
            token=payload[len(VERIFY_PREFIX) :],
            telegram_id=str(sender.get("id", chat_id)),
            username=sender.get("username") or "",
        )
    else:
        client.send_message(chat_id, templates.welcome_no_token(), links=verification_links())


def _handle_verification(*, chat_id: int, token: str, telegram_id: str, username: str) -> None:
    try:
        VerifyTelegramRegistrationService.execute(
            token=token,
            telegram_id=telegram_id,
            telegram_username=username,
        )
    except (InvalidVerificationTokenError, VerificationExpiredError):
        client.send_message(chat_id, templates.verification_invalid_or_expired())
    except TelegramAlreadyLinkedError:
        client.send_message(chat_id, templates.verification_telegram_already_linked())
    except Exception:  # noqa: BLE001 - one bad update must not fail the webhook
        logger.exception("Unexpected error verifying Telegram registration")
    else:
        client.send_message(
            chat_id, templates.verification_success(), links=verification_links()
        )


# -- order buttons --------------------------------------------------------------
def _handle_callback(callback: dict) -> None:
    from apps.accounts.models import TelegramAccount
    from apps.common.exceptions import ServiceError
    from apps.orders.models import Order

    callback_id = callback.get("id", "")
    parts = (callback.get("data") or "").split(":")
    if len(parts) != 3 or parts[0] != "order" or not parts[2].isdigit():
        client.answer_callback_query(callback_id)
        return
    _, action, raw_id = parts
    message = callback.get("message") or {}
    chat_id = (message.get("chat") or {}).get("id")
    message_id = message.get("message_id")
    sender_id = str((callback.get("from") or {}).get("id", ""))

    account = TelegramAccount.objects.select_related("user").filter(telegram_id=sender_id).first()
    order = (
        Order.objects.select_related("store__owner", "customer", "address__village")
        .filter(pk=int(raw_id))
        .first()
    )
    if account is None or order is None or order.store.owner_id != account.user_id:
        client.answer_callback_query(callback_id, templates.callback_forbidden(), alert=True)
        return

    run = _order_actions().get(action)
    if run is None:
        client.answer_callback_query(callback_id)
        return

    try:
        run(order, account.user)
    except ServiceError:
        answer = templates.callback_stale()
    except Exception:  # noqa: BLE001 - never fail the webhook
        logger.exception("Unexpected error handling order callback %s", callback.get("data"))
        answer = templates.callback_failed()
    else:
        answer = templates.callback_done()
    client.answer_callback_query(callback_id, answer)

    # Re-render with the real (fresh) state either way so stale buttons vanish.
    order = Order.objects.select_related("store__owner", "customer", "address__village").get(
        pk=order.pk
    )
    if chat_id is not None and message_id is not None:
        from apps.notifications.telegram.services import seller_order_view

        text, actions, links = seller_order_view(order)
        client.edit_message(chat_id, message_id, text, links=links, actions=actions)


def _order_actions():
    from apps.orders.services import (
        AcceptOrderService,
        CancelOrderService,
        CompleteOrderService,
        MarkDeliveringService,
        RejectOrderService,
    )

    return {
        "accept": lambda order, user: AcceptOrderService.execute(order=order),
        "reject": lambda order, user: RejectOrderService.execute(
            order=order, reason="Do'kon buyurtmani qabul qila olmadi"
        ),
        "deliver": lambda order, user: MarkDeliveringService.execute(order=order),
        "complete": lambda order, user: CompleteOrderService.execute(order=order),
        "cancel": lambda order, user: CancelOrderService.execute(order=order, actor=user),
    }
