"""Authorization matrix: every id-based endpoint must refuse the wrong actor (IDOR guard)."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.accounts.models import Address
from apps.notifications.models import Notification
from apps.orders.models import Cart, CartItem, Order, OrderItem, PromoCode, ReturnRequest
from apps.products.models import ProductImage, ProductVariant
from apps.stores.models import DeliveryZone, Store, Village

pytestmark = pytest.mark.django_db
DENIED = (401, 403, 404)


@pytest.fixture(autouse=True)
def _fresh_throttle():
    from django.core.cache import cache

    cache.clear()


def api_for(user=None):
    c = APIClient()
    if user:
        c.force_authenticate(user)
    return c


@pytest.fixture
def world(user, shop, address):
    store, product = shop
    User = get_user_model()
    stranger = User.objects.create_user(phone="+998900000070", password="pw12345678")
    owner2 = User.objects.create_user(phone="+998900000071", password="pw12345678")
    Store.objects.create(owner=owner2, name="S2", phone="+998900000071", status="ACTIVE")
    order = Order.objects.create(
        customer=user, store=store, address=address, delivery_price="0", subtotal="10", total="10"
    )
    OrderItem.objects.create(order=order, product=product, price="10", quantity=1, subtotal="10")
    ret = ReturnRequest.objects.create(order=order, reason="x")
    cart = Cart.objects.create(user=user)
    item = CartItem.objects.create(cart=cart, product=product, quantity=1)
    image = ProductImage.objects.create(product=product, image="products/images/x.webp")
    variant = ProductVariant.objects.create(product=product, sku="V1", attributes={"a": "b"})
    village = Village.objects.create(name="V2", district="D")
    zone = DeliveryZone.objects.create(store=store, village=village, delivery_price="1000")
    note = Notification.objects.create(user=user, title="t")
    promo = PromoCode.objects.create(code="MINE", kind="PERCENT", value=5, store=store)
    return {
        "owner": store.owner, "customer": user, "stranger": stranger, "owner2": owner2,
        "ids": {
            "order": order.pk, "address": address.pk, "item": item.pk, "image": image.pk,
            "variant": variant.pk, "zone": zone.pk, "note": note.pk, "promo": promo.pk,
            "product": product.pk, "store": store.pk, "ret": ret.pk,
        },
    }


# (method, path template, body) — the actor must NOT be able to do these to someone else's data
FOREIGN_TO_CUSTOMER = [  # belong to the customer; owner2/stranger must be refused
    ("get", "addresses/{address}", None),
    ("patch", "addresses/{address}", {"street": "hack"}),
    ("delete", "addresses/{address}", None),
    ("patch", "cart/items/{item}", {"quantity": 5}),
    ("delete", "cart/items/{item}", None),
    ("get", "orders/{order}", None),
    ("post", "orders/{order}/cancel", None),
    ("post", "orders/{order}/reorder", None),
    ("post", "orders/{order}/return", {"reason": "x"}),
]
FOREIGN_TO_SELLER = [  # belong to store 1; stranger (non-seller) and owner2 (other seller) refused
    ("get", "orders/{order}/print", None),
    ("post", "orders/{order}/accept", None),
    ("post", "orders/{order}/reject", {"reason": "no"}),
    ("post", "orders/{order}/delivering", {}),
    ("post", "orders/{order}/complete", None),
    ("post", "orders/{order}/return/decide", {"approve": True}),
    ("patch", "products/{product}", {"name": "hacked"}),
    ("delete", "products/{product}", None),
    ("post", "products/{product}/variants", {"sku": "Z", "attributes": {"a": "b"}}),
    ("patch", "product-variants/{variant}", {"stock": 999}),
    ("delete", "product-variants/{variant}", None),
    ("delete", "product-images/{image}", None),
    ("post", "products/{product}/images/reorder", {"images": []}),
    ("patch", "delivery-zones/{zone}", {"delivery_price": "0"}),
    ("delete", "delivery-zones/{zone}", None),
    ("patch", "stores/my/promo-codes/{promo}", {"is_active": False}),
    ("delete", "stores/my/promo-codes/{promo}", None),
]
ADMIN_ONLY = [
    ("post", "categories", {"name": "X"}),
    ("patch", "categories/1", {"name": "X"}),
    ("delete", "categories/1", None),
    ("post", "banners/", {"title": "x"}),
    ("delete", "banners/1", None),
    ("post", "admin/store-applications/1/approve", None),
    ("post", "admin/store-applications/1/reject", {"reason": "x"}),
    ("post", "villages", {"name": "x", "district": "y"}),
]


def call(client, method, path, body):
    return getattr(client, method)(f"/api/v1/{path}", body, format="json")


@pytest.mark.parametrize("actor", ["stranger", "owner2"])
@pytest.mark.parametrize("method,path,body", FOREIGN_TO_CUSTOMER + FOREIGN_TO_SELLER)
def test_wrong_actor_is_refused(world, actor, method, path, body):
    res = call(api_for(world[actor]), method, path.format(**world["ids"]), body)
    assert res.status_code in DENIED, f"{actor} {method.upper()} {path} -> {res.status_code}"


@pytest.mark.parametrize("method,path,body", FOREIGN_TO_CUSTOMER + FOREIGN_TO_SELLER)
def test_anonymous_is_refused(world, method, path, body):
    res = call(api_for(), method, path.format(**world["ids"]), body)
    assert res.status_code in (401, 403, 404), f"anon {method.upper()} {path} -> {res.status_code}"


@pytest.mark.parametrize("method,path,body", ADMIN_ONLY)
@pytest.mark.parametrize("actor", ["customer", "owner"])
def test_admin_only_endpoints(world, actor, method, path, body):
    res = call(api_for(world[actor]), method, path, body)
    assert res.status_code in DENIED, f"{actor} {method.upper()} {path} -> {res.status_code}"


def test_customer_cannot_use_seller_endpoints(world):
    c = api_for(world["customer"])
    for method, path in [
        ("get", "products/my"), ("get", "orders/store"), ("get", "orders/store/stats"),
        ("get", "orders/store/export"), ("get", "products/my/export"), ("get", "reviews/my"),
        ("get", "stores/my/promo-codes"), ("patch", "stores/my"),
    ]:
        assert call(c, method, path, {}).status_code in (403, 404), path


def test_state_unchanged_after_attacks(world):
    ids = world["ids"]
    order = Order.objects.get(pk=ids["order"])
    for method, path, body in FOREIGN_TO_CUSTOMER + FOREIGN_TO_SELLER:
        call(api_for(world["stranger"]), method, path.format(**ids), body)
    order.refresh_from_db()
    assert order.status == "PENDING"
    assert Address.objects.filter(pk=ids["address"]).exists()
    assert CartItem.objects.get(pk=ids["item"]).quantity == 1
    assert PromoCode.objects.get(pk=ids["promo"]).is_active is True
    # Idempotent 204, but strictly scoped to the caller: the victim's row stays unread.
    call(api_for(world["stranger"]), "post", f"notifications/{ids['note']}/read", None)
    assert Notification.objects.get(pk=ids["note"]).is_read is False
    assert ProductVariant.objects.filter(pk=ids["variant"]).exists()
    from apps.products.models import Product

    assert Product.objects.get(pk=ids["product"]).name == "Plov"


def test_unauthenticated_cannot_read_private_lists():
    c = api_for()
    for path in ["orders/my", "cart", "addresses", "notifications", "favorites", "auth/me"]:
        assert c.get(f"/api/v1/{path}").status_code == 401, path
