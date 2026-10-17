"""Thin wrapper around the Telegram Bot HTTP API.

Deliberately not built on a bot framework (python-telegram-bot/aiogram):
the bot only needs to (a) send messages to known chat ids and (b) long-poll
for the handful of commands handled in ``apps.notifications.telegram.bot``,
so a small ``requests``-based client keeps the dependency footprint minimal
and makes every HTTP call to Telegram explicit and easy to trace.
"""

from __future__ import annotations

import logging
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

API_BASE = "https://api.telegram.org"
# Generous but bounded: this is used both for sendMessage (should return
# fast) and for long-polling getUpdates (which blocks server-side for up to
# `timeout` seconds), so the HTTP client timeout must exceed the poll timeout.
DEFAULT_TIMEOUT = 15


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
) -> dict:
    url = f"{API_BASE}/bot{_token()}/{method}"
    response = requests.post(url, json=payload or {}, timeout=timeout)
    data = response.json()
    if not data.get("ok"):
        raise RuntimeError(f"Telegram API error on {method}: {data}")
    return data["result"]


def send_message(chat_id: str | int, text: str, *, parse_mode: str = "HTML") -> dict | None:
    """Send a message, logging (not raising) on failure.

    Notification delivery must never break the caller's transaction (e.g. a
    store approval must still succeed even if Telegram is unreachable), so
    every failure mode here is caught and logged rather than propagated.
    """
    try:
        return _call(
            "sendMessage",
            {"chat_id": chat_id, "text": text, "parse_mode": parse_mode},
        )
    except TelegramNotConfigured:
        logger.warning("Telegram message not sent (bot not configured): %s", text[:80])
    except Exception:  # noqa: BLE001 - best-effort notification, never crash callers
        logger.exception("Failed to send Telegram message to chat_id=%s", chat_id)
    return None


def get_updates(offset: int | None = None, timeout: int = 30) -> list[dict]:
    """Long-poll for new updates. Used by the `run_telegram_bot` management command."""
    payload: dict[str, Any] = {"timeout": timeout}
    if offset is not None:
        payload["offset"] = offset
    return _call("getUpdates", payload, timeout=timeout + DEFAULT_TIMEOUT)


def set_my_commands(commands: list[dict[str, str]]) -> None:
    try:
        _call("setMyCommands", {"commands": commands})
    except Exception:  # noqa: BLE001
        logger.exception("Failed to register bot commands")
