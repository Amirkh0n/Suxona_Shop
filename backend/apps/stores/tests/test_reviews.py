import pytest
from rest_framework.test import APIClient

from apps.orders.models import Order
from apps.stores.models import StoreReview

pytestmark = pytest.mark.django_db


@pytest.fixture
def order(user, shop):
    store, _ = shop
    return Order.objects.create(
        customer=user, store=store, delivery_method="PICKUP",
        status="COMPLETED", subtotal=10, delivery_price=0, total=10,
    )


def _client(u):
    c = APIClient()
    c.force_authenticate(u)
    return c


def test_review_updates_store_rating(user, shop, order):
    store, _ = shop
    r = _client(user).post(
        f"/api/v1/orders/{order.pk}/review", {"rating": 4, "comment": "Zo'r"}, format="json"
    )
    assert r.status_code == 201, r.data
    store.refresh_from_db()
    assert store.rating_count == 1
    assert float(store.rating_avg) == 4.0
    listing = APIClient().get(f"/api/v1/stores/{store.pk}/reviews")
    assert listing.data["count"] == 1
    assert listing.data["results"][0]["customer_name"] == "Ali"


def test_second_review_is_conflict(user, order):
    c = _client(user)
    c.post(f"/api/v1/orders/{order.pk}/review", {"rating": 5}, format="json")
    r = c.post(f"/api/v1/orders/{order.pk}/review", {"rating": 1}, format="json")
    assert r.status_code == 409
    assert StoreReview.objects.count() == 1


def test_only_completed_orders_can_be_reviewed(user, order):
    order.status = "PENDING"
    order.save()
    r = _client(user).post(f"/api/v1/orders/{order.pk}/review", {"rating": 5}, format="json")
    assert r.status_code == 400


def test_stranger_gets_404_and_rating_is_bounded(staff, user, order):
    assert (
        _client(staff).post(f"/api/v1/orders/{order.pk}/review", {"rating": 5}, format="json")
        .status_code == 404
    )
    assert (
        _client(user).post(f"/api/v1/orders/{order.pk}/review", {"rating": 6}, format="json")
        .status_code == 400
    )
