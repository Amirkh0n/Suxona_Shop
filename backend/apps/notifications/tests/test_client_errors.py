import pytest
import requests

from apps.notifications.telegram import client


def test_network_error_does_not_leak_bot_token(settings, monkeypatch):
    settings.TELEGRAM_BOT_TOKEN = "123456:SECRET-TOKEN"

    def boom(url, **kwargs):
        raise requests.exceptions.ProxyError(f"Max retries exceeded with url: {url}")

    monkeypatch.setattr(client.requests, "post", boom)
    with pytest.raises(RuntimeError) as err:
        client.set_webhook("https://example.com/hook", secret_token="s")
    assert "SECRET-TOKEN" not in str(err.value)
    assert err.value.__cause__ is None and err.value.__suppress_context__


def test_relay_base_url_and_key_are_used(settings, monkeypatch):
    settings.TELEGRAM_BOT_TOKEN = "1:tok"
    settings.TELEGRAM_API_BASE_URL = "https://relay.example.workers.dev"
    settings.TELEGRAM_RELAY_KEY = "k3y"
    seen = {}

    class Resp:
        status_code = 200

        def json(self):
            return {"ok": True, "result": True}

    def fake_post(url, json=None, headers=None, timeout=None):
        seen.update(url=url, headers=headers)
        return Resp()

    monkeypatch.setattr(client.requests, "post", fake_post)
    client._call("getMe")
    assert seen["url"] == "https://relay.example.workers.dev/bot1:tok/getMe"
    assert seen["headers"] == {"X-Relay-Key": "k3y"}


def test_default_goes_straight_to_telegram(settings, monkeypatch):
    settings.TELEGRAM_BOT_TOKEN = "1:tok"
    settings.TELEGRAM_RELAY_KEY = ""
    seen = {}

    class Resp:
        status_code = 200

        def json(self):
            return {"ok": True, "result": 1}

    monkeypatch.setattr(
        client.requests, "post", lambda url, **kw: seen.update(url=url, **kw) or Resp()
    )
    client._call("getMe")
    assert seen["url"] == "https://api.telegram.org/bot1:tok/getMe" and seen["headers"] == {}
