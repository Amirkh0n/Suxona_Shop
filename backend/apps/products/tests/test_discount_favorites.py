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


def _make(store, category, name, price, **kw):
    from apps.products.models import Product

    return Product.objects.create(
        store=store, category=category, name=name, price=price, stock=5, status="ACTIVE", **kw
    )


def test_search_sort_and_price_filters(shop):
    store, plov = shop
    cat = plov.category
    _make(store, cat, "Osh plov maxsus", 30)
    _make(store, cat, "Non", 3, description="issiq plov bilan")
    client = APIClient()

    def names(qs):
        return [p["name"] for p in client.get(f"/api/v1/products?{qs}").data["results"]]

    # multi-word: both words must match; name hits rank first
    assert names("search=plov") == ["Osh plov maxsus", "Plov", "Non"] or names(
        "search=plov"
    )[-1] == "Non"
    assert names("search=osh%20plov") == ["Osh plov maxsus"]
    assert names("ordering=price_asc") == ["Non", "Plov", "Osh plov maxsus"]
    assert names("ordering=price_desc")[0] == "Osh plov maxsus"
    assert names("min_price=5&max_price=15") == ["Plov"]
    assert names("min_price=abc") != []  # garbage is ignored, not a 500


def test_popular_and_discount_ordering(user, shop):
    from apps.orders.models import Order, OrderItem

    store, plov = shop
    other = _make(store, plov.category, "Sale", 10, old_price=20)
    order = Order.objects.create(
        customer=user, store=store, delivery_method="PICKUP", status="COMPLETED",
        subtotal=10, delivery_price=0, total=10,
    )
    OrderItem.objects.create(order=order, product=plov, price=10, quantity=3, subtotal=30)
    client = APIClient()
    popular = client.get("/api/v1/products?ordering=popular").data["results"]
    assert popular[0]["id"] == plov.pk
    discount = client.get("/api/v1/products?ordering=discount").data["results"]
    assert discount[0]["id"] == other.pk


def test_similar_products(shop):
    store, plov = shop
    twin = _make(store, plov.category, "Lagmon", 12)
    r = APIClient().get(f"/api/v1/products/{plov.pk}/similar")
    assert [p["id"] for p in r.data] == [twin.pk]


def test_product_review_requires_purchase_and_updates_rating(user, shop):
    from apps.orders.models import Order, OrderItem

    store, product = shop
    c = APIClient()
    c.force_authenticate(user)
    url = f"/api/v1/products/{product.pk}/reviews"
    assert c.post(url, {"rating": 5}, format="json").status_code == 400  # never bought

    order = Order.objects.create(
        customer=user, store=store, delivery_method="PICKUP", status="COMPLETED",
        subtotal=10, delivery_price=0, total=10,
    )
    OrderItem.objects.create(order=order, product=product, price=10, quantity=1, subtotal=10)
    assert c.post(url, {"rating": 4, "comment": "ok"}, format="json").status_code == 201
    assert c.post(url, {"rating": 1}, format="json").status_code == 409
    product.refresh_from_db()
    assert product.rating_count == 1 and float(product.rating_avg) == 4.0
    assert APIClient().get(url).data["count"] == 1
    best = APIClient().get("/api/v1/products?ordering=rating").data["results"][0]
    assert best["id"] == product.pk and best["rating_count"] == 1


def test_my_products_search_and_status_filter(shop):
    store, plov = shop
    hidden = _make(store, plov.category, "Lagmon", 12)
    hidden.status = "HIDDEN"
    hidden.save()
    c = APIClient()
    c.force_authenticate(store.owner)
    assert c.get("/api/v1/products/my?search=lag").data["count"] == 1
    assert c.get("/api/v1/products/my?status=ACTIVE").data["count"] == 1
    assert c.get("/api/v1/products/my").data["count"] == 2
