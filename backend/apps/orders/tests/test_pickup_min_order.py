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


def _completed_order(user, store, product, **kw):
    from apps.orders.models import OrderItem

    order = Order.objects.create(
        customer=user, store=store, delivery_method="PICKUP", status="COMPLETED",
        subtotal=20, delivery_price=0, total=20, **kw,
    )
    OrderItem.objects.create(order=order, product=product, price=10, quantity=2, subtotal=20)
    return order


def test_return_request_flow(user, shop):
    store, product = shop
    order = _completed_order(user, store, product)
    buyer, seller = APIClient(), APIClient()
    buyer.force_authenticate(user)
    seller.force_authenticate(store.owner)

    url = f"/api/v1/orders/{order.pk}/return"
    assert buyer.post(url, {"reason": "Buzilgan"}, format="json").status_code == 201
    assert buyer.post(url, {"reason": "again"}, format="json").status_code == 409
    assert buyer.get(f"/api/v1/orders/{order.pk}").data["return_request"]["status"] == "PENDING"

    decide = seller.post(f"{url}/decide", {"approve": True, "note": "Ok"}, format="json")
    assert decide.status_code == 200 and decide.data["status"] == "APPROVED"
    assert seller.post(f"{url}/decide", {"approve": False}, format="json").status_code == 409


def test_return_only_for_recent_completed_own_orders(user, staff, shop):
    from datetime import timedelta

    from django.utils import timezone

    store, product = shop
    order = _completed_order(user, store, product)
    stranger = APIClient()
    stranger.force_authenticate(staff)
    assert stranger.post(
        f"/api/v1/orders/{order.pk}/return", {"reason": "x"}, format="json"
    ).status_code == 404

    Order.objects.filter(pk=order.pk).update(updated_at=timezone.now() - timedelta(days=8))
    buyer = APIClient()
    buyer.force_authenticate(user)
    assert buyer.post(
        f"/api/v1/orders/{order.pk}/return", {"reason": "late"}, format="json"
    ).status_code == 400


def test_courier_is_recorded_when_delivering(user, shop):
    store, product = shop
    order = _completed_order(user, store, product)
    Order.objects.filter(pk=order.pk).update(status="ACCEPTED")
    seller = APIClient()
    seller.force_authenticate(store.owner)
    r = seller.post(
        f"/api/v1/orders/{order.pk}/delivering",
        {"courier_name": "Vali", "courier_phone": "+998901234567"},
        format="json",
    )
    assert r.status_code == 200, r.data
    assert r.data["courier_name"] == "Vali"


def test_seller_stats(user, shop):
    store, product = shop
    _completed_order(user, store, product)
    seller = APIClient()
    seller.force_authenticate(store.owner)
    r = seller.get("/api/v1/orders/store/stats?days=7")
    assert r.status_code == 200
    assert r.data["orders_completed"] == 1
    assert float(r.data["revenue"]) == 20.0
    assert len(r.data["daily"]) == 7
    assert r.data["top_products"][0]["quantity"] == 2
    # customers cannot read it
    buyer = APIClient()
    buyer.force_authenticate(user)
    assert buyer.get("/api/v1/orders/store/stats").status_code in (403, 404)
