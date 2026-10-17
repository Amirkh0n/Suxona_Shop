"""Telegram bot update handling.

``handle_update`` is a pure function of one Telegram ``update`` dict, so the
same code serves long-polling (``manage.py run_telegram_bot``) today and a
webhook endpoint later without changes.

Supported:
* ``/start verify_<token>`` – completes registration verification by calling
  ``VerifyTelegramRegistrationService`` directly (no HTTP self-call).
* ``/start`` – friendly welcome.
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

logger = logging.getLogger(__name__)

VERIFY_PREFIX = "verify_"


def handle_update(update: dict) -> None:
    message = update.get("message") or {}
    text = (message.get("text") or "").strip()
    sender = message.get("from") or {}
    chat_id = (message.get("chat") or {}).get("id")
    if not text or chat_id is None:
        return

    if not text.startswith("/start"):
        return

    payload = text[len("/start"):].strip()
    if payload.startswith(VERIFY_PREFIX):
        _handle_verification(
            chat_id=chat_id,
            token=payload[len(VERIFY_PREFIX):],
            telegram_id=str(sender.get("id", chat_id)),
            username=sender.get("username") or "",
        )
    else:
        client.send_message(chat_id, templates.welcome_no_token())


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
    except Exception:  # noqa: BLE001 - never let one bad update kill the poll loop
        logger.exception("Unexpected error verifying Telegram registration")
    else:
        client.send_message(chat_id, templates.verification_success())
