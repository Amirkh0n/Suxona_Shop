import pytest
from django.core.management import CommandError, call_command

from apps.notifications.telegram import client


@pytest.fixture
def calls(monkeypatch, settings):
    settings.TELEGRAM_BOT_TOKEN = "t"
    recorded = []
    monkeypatch.setattr(
        client, "_call", lambda m, p=None, timeout=5: recorded.append((m, p)) or True
    )
    return recorded


def test_https_links_become_buttons(calls):
    client.send_message(1, "hi", links=[("Open", "https://x.uz/a")])
    payload = calls[0][1]
    assert payload["reply_markup"]["inline_keyboard"][0][0]["url"] == "https://x.uz/a"
    assert "🔗" not in payload["text"]


def test_http_links_fall_back_to_text_not_buttons(calls):
    client.send_message(1, "hi", links=[("Open", "http://localhost:5173/a")])
    payload = calls[0][1]
    assert "reply_markup" not in payload  # Telegram would reject the whole message
    assert "http://localhost:5173/a" in payload["text"]


def test_send_failure_is_swallowed(settings, monkeypatch):
    settings.TELEGRAM_BOT_TOKEN = "t"

    def boom(*a, **k):
        raise RuntimeError("down")

    monkeypatch.setattr(client, "_call", boom)
    assert client.send_message(1, "x") is None


def test_set_webhook_command(calls, settings):
    settings.TELEGRAM_WEBHOOK_SECRET = "sec"
    settings.SITE_BASE_URL = "https://shop.example.com"
    call_command("set_telegram_webhook")
    method, payload = calls[0]
    assert method == "setWebhook"
    assert payload["url"] == "https://shop.example.com/api/v1/telegram/webhook"
    assert payload["secret_token"] == "sec"


def test_set_webhook_refuses_http(calls, settings):
    settings.TELEGRAM_WEBHOOK_SECRET = "sec"
    settings.SITE_BASE_URL = "http://localhost:8000"
    with pytest.raises(CommandError, match="https"):
        call_command("set_telegram_webhook")
