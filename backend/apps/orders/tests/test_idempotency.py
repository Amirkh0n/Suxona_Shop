import pytest
from rest_framework.test import APIClient

from apps.orders.models import Cart, CartItem, IdempotencyKey, Order
from apps.stores.models import DeliveryZone

pytestmark = pytest.mark.django_db

URL = "/api/v1/orders"
KEY = "checkout-0001-abcdef"


@pytest.fixture
def ready(user, shop, address):
    store, product = shop
    DeliveryZone.objects.create(store=store, village=address.village, delivery_price="0")
    cart = Cart.objects.create(user=user)
    CartItem.objects.create(cart=cart, product=product, quantity=2)
    client = APIClient()
    client.force_authenticate(user)
    body = {"store_id": store.pk, "address_id": address.pk, "note": "n"}
    return client, body, product


def test_same_key_replays_the_order_once(ready):
    client, body, product = ready
    first = client.post(URL, body, format="json", headers={"Idempotency-Key": KEY})
    second = client.post(URL, body, format="json", headers={"Idempotency-Key": KEY})

    assert first.status_code == 201
    assert second.status_code == 200
    assert second["Idempotent-Replayed"] == "true"
    assert second.data["id"] == first.data["id"]
    assert Order.objects.count() == 1
    product.refresh_from_db()
    assert product.stock == 3  # 5 - 2, deducted once


def test_same_key_other_payload_is_422(ready):
    client, body, _ = ready
    client.post(URL, body, format="json", headers={"Idempotency-Key": KEY})
    r = client.post(URL, {**body, "note": "other"}, format="json", headers={"Idempotency-Key": KEY})
    assert r.status_code == 422
    assert Order.objects.count() == 1


def test_failed_checkout_leaves_key_free_for_retry(ready, user):
    client, body, _ = ready
    CartItem.objects.all().delete()  # empty cart -> checkout fails
    bad = client.post(URL, body, format="json", headers={"Idempotency-Key": KEY})
    assert bad.status_code == 400
    assert not IdempotencyKey.objects.exists()

    CartItem.objects.create(cart=Cart.objects.get(user=user), product=ready[2], quantity=1)
    ok = client.post(URL, body, format="json", headers={"Idempotency-Key": KEY})
    assert ok.status_code == 201


def test_invalid_key_is_400(ready):
    client, body, _ = ready
    r = client.post(URL, body, format="json", headers={"Idempotency-Key": "short"})
    assert r.status_code == 400


def test_without_key_behaves_as_before(ready):
    client, body, _ = ready
    r = client.post(URL, body, format="json")
    assert r.status_code == 201
    assert not IdempotencyKey.objects.exists()


def test_keys_are_scoped_per_user(ready, django_user_model):
    client, body, _ = ready
    client.post(URL, body, format="json", headers={"Idempotency-Key": KEY})
    other = django_user_model.objects.create_user(
        phone="+998900000066", password="x12345678", first_name="Z"
    )
    c2 = APIClient()
    c2.force_authenticate(other)
    r = c2.post(URL, body, format="json", headers={"Idempotency-Key": KEY})
    assert r.status_code != 200  # not another user's replay (address isn't theirs -> 404)
