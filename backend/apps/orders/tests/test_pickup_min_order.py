import pytest
from rest_framework.test import APIClient

from apps.orders.models import Cart, CartItem, Order

pytestmark = pytest.mark.django_db

URL = "/api/v1/orders"


@pytest.fixture
def cart(user, shop):
    store, product = shop
    c = Cart.objects.create(user=user)
    CartItem.objects.create(cart=c, product=product, quantity=2)  # 20.00
    client = APIClient()
    client.force_authenticate(user)
    return client, store


def test_pickup_needs_no_address_and_is_free(cart):
    client, store = cart
    store.allows_pickup = True
    store.save()
    r = client.post(
        URL, {"store_id": store.pk, "delivery_method": "PICKUP", "contact_name": "Vali"},
        format="json",
    )
    assert r.status_code == 201, r.data
    order = Order.objects.get()
    assert order.address is None
    assert order.delivery_method == "PICKUP"
    assert order.contact_name == "Vali"
    assert order.contact_phone == "+998900000001"  # defaults to the customer's phone
    assert order.delivery_price == 0
    assert r.data["address"] is None


def test_pickup_rejected_when_store_does_not_allow_it(cart):
    client, store = cart
    store.allows_pickup = False
    store.save()
    r = client.post(URL, {"store_id": store.pk, "delivery_method": "PICKUP"}, format="json")
    assert r.status_code == 400
    assert not Order.objects.exists()


def test_delivery_requires_address(cart):
    client, store = cart
    r = client.post(URL, {"store_id": store.pk}, format="json")
    assert r.status_code == 400


def test_minimum_order_amount_enforced(cart):
    client, store = cart
    store.allows_pickup = True
    store.min_order_amount = "50.00"
    store.save()
    r = client.post(URL, {"store_id": store.pk, "delivery_method": "PICKUP"}, format="json")
    assert r.status_code == 400
    assert not Order.objects.exists()
    store.min_order_amount = "20.00"
    store.save()
    r = client.post(URL, {"store_id": store.pk, "delivery_method": "PICKUP"}, format="json")
    assert r.status_code == 201


def test_promo_code_discounts_and_is_single_use(cart):
    from apps.orders.models import PromoCode

    client, store = cart
    store.allows_pickup = True
    store.save()
    promo = PromoCode.objects.create(code="  welcome10 ", kind="PERCENT", value=10, max_uses=5)
    assert promo.code == "WELCOME10"

    check = client.post(
        "/api/v1/promo/check", {"store_id": store.pk, "code": "welcome10"}, format="json"
    )
    assert check.status_code == 200
    assert float(check.data["discount"]) == 2.0  # 10% of 20

    r = client.post(
        URL,
        {"store_id": store.pk, "delivery_method": "PICKUP", "promo_code": "welcome10"},
        format="json",
    )
    assert r.status_code == 201, r.data
    order = Order.objects.get()
    assert float(order.discount_amount) == 2.0
    assert float(order.total) == 18.0
    promo.refresh_from_db()
    assert promo.used_count == 1

    # Cancelling gives the use back.
    client.post(f"/api/v1/orders/{order.pk}/cancel")
    promo.refresh_from_db()
    assert promo.used_count == 0


def test_invalid_promo_is_400_and_creates_nothing(cart):
    client, store = cart
    store.allows_pickup = True
    store.save()
    r = client.post(
        URL,
        {"store_id": store.pk, "delivery_method": "PICKUP", "promo_code": "NOPE"},
        format="json",
    )
    assert r.status_code == 400
    assert not Order.objects.exists()
