from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import TelegramAccount, VerificationToken

pytestmark = pytest.mark.django_db

URL = "/api/v1/telegram/webhook"
HEADER = "HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN"


@pytest.fixture
def secret(settings):
    settings.TELEGRAM_WEBHOOK_SECRET = "s3cret"
    return "s3cret"


def _update(text):
    return {
        "update_id": 1,
        "message": {"text": text, "from": {"id": 42, "username": "u"}, "chat": {"id": 42}},
    }


def test_rejects_missing_or_wrong_secret(secret, sent):
    c = APIClient()
    assert c.post(URL, _update("/start"), format="json").status_code == 403
    assert c.post(URL, _update("/start"), format="json", **{HEADER: "nope"}).status_code == 403
    assert sent == []


def test_fails_closed_when_secret_not_configured(settings, sent):
    settings.TELEGRAM_WEBHOOK_SECRET = ""
    assert APIClient().post(URL, _update("/start"), format="json").status_code == 503


def test_valid_update_is_handled_synchronously(secret, sent):
    resp = APIClient().post(URL, _update("/start"), format="json", **{HEADER: secret})
    assert resp.status_code == 200 and resp.json() == {"ok": True}
    assert "SuxonaShop" in sent[0][1]


def test_verification_via_webhook(secret, user, sent):
    user.is_active = False
    user.save()
    VerificationToken.objects.create(
        user=user, token="abc", expires_at=timezone.now() + timedelta(minutes=5)
    )
    resp = APIClient().post(URL, _update("/start verify_abc"), format="json", **{HEADER: secret})
    assert resp.status_code == 200
    user.refresh_from_db()
    assert user.is_active
    assert TelegramAccount.objects.get(user=user).telegram_id == "42"


def test_handler_errors_still_return_200(secret, monkeypatch):
    def boom(update):
        raise RuntimeError("x")

    monkeypatch.setattr("apps.notifications.views.handle_update", boom)
    resp = APIClient().post(URL, _update("/start"), format="json", **{HEADER: secret})
    assert resp.status_code == 200
