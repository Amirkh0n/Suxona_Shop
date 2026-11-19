import pytest
from rest_framework.test import APIClient

from apps.products.models import Favorite

pytestmark = pytest.mark.django_db


def test_discount_percent_and_on_sale_filter(shop):
    store, product = shop
    product.old_price = "20.00"
    product.save()
    client = APIClient()
    r = client.get("/api/v1/products?on_sale=true")
    assert r.status_code == 200
    assert r.data["results"][0]["discount_percent"] == 50
    product.old_price = None
    product.save()
    assert client.get("/api/v1/products?on_sale=true").data["results"] == []


def test_old_price_must_exceed_price(shop):
    store, _ = shop
    client = APIClient()
    client.force_authenticate(store.owner)
    r = client.patch(
        f"/api/v1/products/{shop[1].pk}", {"old_price": "5.00"}, format="json"
    )
    assert r.status_code == 400


def test_public_store_listing_hides_unapproved(shop):
    store, product = shop
    product.status = "PENDING_REVIEW"
    product.save()
    r = APIClient().get(f"/api/v1/products?store={store.pk}")
    assert r.data["results"] == []


def test_favorites_flow(user, shop):
    _, product = shop
    client = APIClient()
    client.force_authenticate(user)
    assert client.put(f"/api/v1/products/{product.pk}/favorite").status_code == 204
    assert client.put(f"/api/v1/products/{product.pk}/favorite").status_code == 204
    assert Favorite.objects.count() == 1
    assert client.get("/api/v1/favorites/ids").data == {"ids": [product.pk]}
    assert client.get("/api/v1/favorites").data["count"] == 1
    assert client.delete(f"/api/v1/products/{product.pk}/favorite").status_code == 204
    assert Favorite.objects.count() == 0


def test_favorites_require_login_and_hide_drafts(shop, user):
    _, product = shop
    assert APIClient().get("/api/v1/favorites").status_code in (401, 403)
    product.status = "DRAFT"
    product.save()
    client = APIClient()
    client.force_authenticate(user)
    assert client.put(f"/api/v1/products/{product.pk}/favorite").status_code == 404
