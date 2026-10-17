from datetime import timedelta

import pytest
from django.utils import timezone

from apps.accounts.models import TelegramAccount, VerificationToken
from apps.notifications.telegram.bot import handle_update

pytestmark = pytest.mark.django_db


def _update(text, tg_id=777):
    return {
        "message": {
            "text": text,
            "from": {"id": tg_id, "username": "bob"},
            "chat": {"id": tg_id},
        }
    }


def _token(user, **kw):
    return VerificationToken.objects.create(
        user=user, token="tok123", expires_at=timezone.now() + timedelta(minutes=30), **kw
    )


def test_start_verify_activates_user_and_links_telegram(user, sent):
    user.is_active = False
    user.save()
    _token(user)

    handle_update(_update("/start verify_tok123"))

    user.refresh_from_db()
    assert user.is_active
    assert TelegramAccount.objects.get(user=user).telegram_id == "777"
    assert "tasdiqlandi" in sent[0][1]


def test_invalid_token_replies_error(sent):
    handle_update(_update("/start verify_nope"))
    assert "yaroqsiz" in sent[0][1]


def test_plain_start_welcomes(sent):
    handle_update(_update("/start"))
    assert "SuxonaShop" in sent[0][1]


def test_token_cannot_be_reused(user, sent):
    _token(user)
    handle_update(_update("/start verify_tok123"))
    handle_update(_update("/start verify_tok123"))
    assert "yaroqsiz" in sent[1][1]
