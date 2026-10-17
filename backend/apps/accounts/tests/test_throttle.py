import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def test_login_is_rate_limited():
    cache.clear()
    client = APIClient()
    codes = [
        client.post("/api/v1/auth/login", {"phone": "+998900000000", "password": "x"}).status_code
        for _ in range(12)
    ]
    assert 429 in codes
    cache.clear()
