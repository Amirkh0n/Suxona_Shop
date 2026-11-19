import pytest
from rest_framework.test import APIClient

from apps.notifications.models import Notification

pytestmark = pytest.mark.django_db


def test_notification_flow(user, staff):
    Notification.objects.create(user=user, title="A")
    Notification.objects.create(user=user, title="B", is_read=True)
    Notification.objects.create(user=staff, title="not mine")
    c = APIClient()
    assert c.get("/api/v1/notifications").status_code in (401, 403)
    c.force_authenticate(user)
    assert c.get("/api/v1/notifications").data["count"] == 2
    assert c.get("/api/v1/notifications/unread-count").data == {"count": 1}
    assert c.post("/api/v1/notifications/read-all").status_code == 204
    assert c.get("/api/v1/notifications/unread-count").data == {"count": 0}


def test_other_users_notification_cannot_be_marked(user, staff):
    n = Notification.objects.create(user=staff, title="x")
    c = APIClient()
    c.force_authenticate(user)
    c.post(f"/api/v1/notifications/{n.pk}/read")
    n.refresh_from_db()
    assert not n.is_read


def test_order_status_creates_notifications(user, shop, address):
    from apps.orders.models import Cart, CartItem
    from apps.stores.models import DeliveryZone

    store, product = shop
    DeliveryZone.objects.create(store=store, village=address.village, delivery_price="0")
    CartItem.objects.create(cart=Cart.objects.create(user=user), product=product, quantity=1)
    c = APIClient()
    c.force_authenticate(user)
    from django.db import transaction  # noqa: F401
    from django.test import override_settings  # noqa: F401

    r = c.post("/api/v1/orders", {"store_id": store.pk, "address_id": address.pk}, format="json")
    assert r.status_code == 201
    # on_commit callbacks don't fire inside the test transaction; run the hook directly
    from apps.notifications.telegram.services import notify_seller_new_order

    notify_seller_new_order(order_id=r.data["id"])
    assert Notification.objects.filter(user=store.owner, kind="order").exists()
