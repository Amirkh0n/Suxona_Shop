"""Thin, synchronous wrapper around the Telegram Bot HTTP API.

Everything here is plain blocking ``requests`` calls — no asyncio, no bot
framework. Incoming updates arrive via webhook (see
``apps.notifications.views.TelegramWebhookView``) and outgoing messages are
sent with ``sendMessage`` from inside the request/transaction that triggered
them, so there is no background worker or event loop to run.
"""

from __future__ import annotations

import logging
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

API_BASE = "https://api.telegram.org"
# Calls happen synchronously inside web requests, so keep the ceiling low: a
# slow Telegram must not hold a gunicorn worker for long.
DEFAULT_TIMEOUT = 5

# (button label, url)
Link = tuple[str, str]


class TelegramNotConfigured(Exception):
    """Raised when TELEGRAM_BOT_TOKEN is not set."""


def _token() -> str:
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        raise TelegramNotConfigured("TELEGRAM_BOT_TOKEN is not configured.")
    return token


def _call(
    method: str,
    payload: dict[str, Any] | None = None,
    timeout: int = DEFAULT_TIMEOUT,
) -> Any:
    url = f"{API_BASE}/bot{_token()}/{method}"
    response = requests.post(url, json=payload or {}, timeout=timeout)
    data = response.json()
    if not data.get("ok"):
        raise RuntimeError(f"Telegram API error on {method}: {data}")
    return data["result"]


def _keyboard(links: list[Link]) -> dict | None:
    """Inline URL buttons, one per row.

    Telegram rejects the *whole message* if any button URL is not https, so
    non-https links (e.g. http://localhost in development) are skipped here
    and rendered as plain text by ``_with_text_links`` instead.
    """
    rows = [[{"text": label, "url": url}] for label, url in links if url.startswith("https://")]
    return {"inline_keyboard": rows} if rows else None


def _with_text_links(text: str, links: list[Link]) -> str:
    plain = [(label, url) for label, url in links if not url.startswith("https://")]
    if not plain:
        return text
    return text + "\n\n" + "\n".join(f"🔗 {label}: {url}" for label, url in plain)


def send_message(
    chat_id: str | int,
    text: str,
    *,
    links: list[Link] | None = None,
    parse_mode: str = "HTML",
) -> dict | None:
    """Send a message, logging (not raising) on failure.

    Notification delivery must never break the caller's transaction (e.g. a
    store approval must still succeed even if Telegram is unreachable), so
    every failure mode here is caught and logged rather than propagated.
    """
    links = links or []
    payload: dict[str, Any] = {
        "chat_id": chat_id,
        "text": _with_text_links(text, links),
        "parse_mode": parse_mode,
        "disable_web_page_preview": True,
    }
    keyboard = _keyboard(links)
    if keyboard:
        payload["reply_markup"] = keyboard
    try:
        return _call("sendMessage", payload)
    except TelegramNotConfigured:
        logger.warning("Telegram message not sent (bot not configured): %s", text[:80])
    except Exception:  # noqa: BLE001 - best-effort notification, never crash callers
        logger.exception("Failed to send Telegram message to chat_id=%s", chat_id)
    return None


# -- webhook management (used by the set/delete/info management commands) ------
def set_webhook(url: str, *, secret_token: str, drop_pending_updates: bool = False) -> bool:
    return _call(
        "setWebhook",
        {
            "url": url,
            "secret_token": secret_token,
            "allowed_updates": ["message"],
            "drop_pending_updates": drop_pending_updates,
        },
    )


def delete_webhook(*, drop_pending_updates: bool = False) -> bool:
    return _call("deleteWebhook", {"drop_pending_updates": drop_pending_updates})


def get_webhook_info() -> dict:
    return _call("getWebhookInfo")


def set_my_commands(commands: list[dict[str, str]]) -> None:
    _call("setMyCommands", {"commands": commands})
