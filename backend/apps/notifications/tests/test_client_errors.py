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
