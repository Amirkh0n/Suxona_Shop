"""High-level notification entry points used by other apps' services.

Callers (e.g. ``apps.stores.services.ApproveStoreService``) should never
import ``client``/``templates`` directly or know how a user's chat id is
resolved — that indirection lives here so the notification call site stays a
single, readable line and the lookup/opt-out logic has one home.
"""

from __future__ import annotations

import logging

from apps.accounts.models import TelegramAccount, User
from apps.notifications.telegram import client, templates

logger = logging.getLogger(__name__)


def _chat_id_for(user: User) -> str | None:
    account = TelegramAccount.objects.filter(user=user).only("telegram_id").first()
    if account is None:
        # Expected, not an error: a user who verified by some other means
        # (or a legacy/test account) simply has nothing to notify.
        logger.info("No linked Telegram account for user_id=%s; skipping notification.", user.pk)
        return None
    return account.telegram_id


def notify_store_application_approved(*, owner: User, store_name: str) -> None:
    chat_id = _chat_id_for(owner)
    if chat_id is None:
        return
    client.send_message(chat_id, templates.store_application_approved(store_name))


def notify_store_application_rejected(
    *, owner: User, store_name: str, admin_note: str = ""
) -> None:
    chat_id = _chat_id_for(owner)
    if chat_id is None:
        return
    client.send_message(chat_id, templates.store_application_rejected(store_name, admin_note))


def notify_admins_new_store_application(*, store_name: str, owner_phone: str) -> None:
    from django.conf import settings

    admin_chat_id = settings.TELEGRAM_ADMIN_CHAT_ID
    if not admin_chat_id:
        return
    client.send_message(
        admin_chat_id,
        templates.new_store_application_for_admin(store_name, owner_phone),
    )
