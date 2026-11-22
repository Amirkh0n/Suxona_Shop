import io

import pytest
from django.core.cache import cache
from PIL import Image
from rest_framework.test import APIClient

from apps.accounts.models import TelegramAccount

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _fresh_cache():
    cache.clear()


@pytest.fixture
def active(user):
    user.is_active = True
    user.save()
    return user


def login(api, phone, password):
    return api.post("/api/v1/auth/login", {"phone": phone, "password": password}, format="json")


def test_login_locks_after_repeated_failures(active):
    api = APIClient()
    for _ in range(5):
        assert login(api, active.phone, "wrong-password").status_code == 401
    # Even the correct password is refused while locked.
    assert login(api, active.phone, "pw12345678").status_code == 429


def test_successful_login_clears_failure_counter(active):
    api = APIClient()
    for _ in range(3):
        login(api, active.phone, "bad")
    assert login(api, active.phone, "pw12345678").status_code == 200
    for _ in range(4):
        login(api, active.phone, "bad")
    assert login(api, active.phone, "pw12345678").status_code == 200


def test_refresh_token_rotates_and_old_one_is_dead(active):
    api = APIClient()
    first = login(api, active.phone, "pw12345678").json()
    second = api.post("/api/v1/auth/refresh", {"refresh": first["refresh"]}, format="json")
    assert second.status_code == 200
    assert second.json()["refresh"] != first["refresh"]
    replay = api.post("/api/v1/auth/refresh", {"refresh": first["refresh"]}, format="json")
    assert replay.status_code == 401
    # The new one keeps working.
    again = api.post("/api/v1/auth/refresh", {"refresh": second.json()["refresh"]}, format="json")
    assert again.status_code == 200


def test_logout_revokes_refresh_token(active):
    api = APIClient()
    tokens = login(api, active.phone, "pw12345678").json()
    out = api.post("/api/v1/auth/logout", {"refresh": tokens["refresh"]}, format="json")
    assert out.status_code == 204
    res = api.post("/api/v1/auth/refresh", {"refresh": tokens["refresh"]}, format="json")
    assert res.status_code == 401


def test_deactivated_user_cannot_refresh(active):
    api = APIClient()
    tokens = login(api, active.phone, "pw12345678").json()
    active.is_active = False
    active.save()
    res = api.post("/api/v1/auth/refresh", {"refresh": tokens["refresh"]}, format="json")
    assert res.status_code == 401


def test_password_reset_revokes_existing_sessions(active, sent):
    TelegramAccount.objects.create(user=active, telegram_id="777", username="a")
    api = APIClient()
    tokens = login(api, active.phone, "pw12345678").json()
    api.post("/api/v1/auth/password-reset", {"phone": active.phone}, format="json")
    code = sent[-1][1].split("<b>")[1].split("</b>")[0]
    res = api.post(
        "/api/v1/auth/password-reset/confirm",
        {"phone": active.phone, "code": code, "new_password": "Zx9!kLm2pQr7"},
        format="json",
    )
    assert res.status_code == 200
    stolen = api.post("/api/v1/auth/refresh", {"refresh": tokens["refresh"]}, format="json")
    assert stolen.status_code == 401


def test_weak_passwords_rejected_on_register_and_reset(active, sent):
    api = APIClient()
    res = api.post(
        "/api/v1/auth/register",
        {"phone": "+998911112233", "password": "12345678", "first_name": "A"},
        format="json",
    )
    assert res.status_code == 400 and "password" in res.json()
    TelegramAccount.objects.create(user=active, telegram_id="777", username="a")
    api.post("/api/v1/auth/password-reset", {"phone": active.phone}, format="json")
    code = sent[-1][1].split("<b>")[1].split("</b>")[0]
    res = api.post(
        "/api/v1/auth/password-reset/confirm",
        {"phone": active.phone, "code": code, "new_password": "password"},
        format="json",
    )
    assert res.status_code == 400


def test_telegram_verify_secret_is_checked(settings):
    settings.TELEGRAM_WEBHOOK_SECRET = "s3cret-value"
    api = APIClient()
    body = {"token": "x", "telegram_id": "1", "username": "u"}
    bad = api.post(
        "/api/v1/auth/telegram/verify",
        body,
        format="json",
        HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN="nope",
    )
    assert bad.status_code == 403
    none = api.post("/api/v1/auth/telegram/verify", body, format="json")
    assert none.status_code == 403


# -- input safety ------------------------------------------------------------------
def test_csv_safe_neutralises_formulas():
    from apps.common.security import csv_safe

    assert csv_safe("=HYPERLINK(\"http://evil\")") == "'=HYPERLINK(\"http://evil\")"
    assert csv_safe("@SUM(A1)") == "'@SUM(A1)"
    assert csv_safe("-2+3") == "'-2+3"
    assert csv_safe("+998901234567") == "+998901234567"  # phone numbers stay readable
    assert csv_safe("Plov") == "Plov" and csv_safe(None) == ""


def _png(w, h):
    buf = io.BytesIO()
    Image.new("RGB", (w, h)).save(buf, "PNG")
    buf.seek(0)
    buf.name = "x.png"
    return buf


def test_image_field_rejects_non_images_and_huge_pixels():
    from django.core.exceptions import ValidationError as DjangoError
    from rest_framework import serializers

    from apps.common.security import SafeImageField

    invalid = (serializers.ValidationError, DjangoError)

    field = SafeImageField()
    from django.core.files.uploadedfile import SimpleUploadedFile

    with pytest.raises(invalid):
        field.run_validation(SimpleUploadedFile("a.png", b"<script>alert(1)</script>"))
    with pytest.raises(invalid):
        field.run_validation(SimpleUploadedFile("a.svg", b"<svg onload=alert(1)></svg>"))
    ok = field.run_validation(SimpleUploadedFile("a.png", _png(10, 10).read()))
    assert ok is not None
    with pytest.raises(invalid):
        field.run_validation(SimpleUploadedFile("big.png", _png(7000, 7000).read()))


def test_seller_promo_rejects_over_100_percent(shop):
    store, _ = shop
    api = APIClient()
    api.force_authenticate(store.owner)
    res = api.post(
        "/api/v1/stores/my/promo-codes",
        {"code": "FREE", "kind": "PERCENT", "value": "150"},
        format="json",
    )
    assert res.status_code == 400
    res = api.post(
        "/api/v1/stores/my/promo-codes",
        {"code": "NEG", "kind": "FIXED", "value": "-5"},
        format="json",
    )
    assert res.status_code == 400


def test_csv_exports_neutralise_formulas(shop):
    store, product = shop
    product.name = "=cmd|' /C calc'!A0"
    product.save()
    api = APIClient()
    api.force_authenticate(store.owner)
    out = api.get("/api/v1/products/my/export").content.decode("utf-8-sig")
    assert "'=cmd" in out and ",=cmd" not in out
