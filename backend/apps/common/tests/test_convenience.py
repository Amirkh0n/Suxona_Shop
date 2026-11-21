
import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from apps.accounts.models import TelegramAccount
from apps.notifications.models import Notification
from apps.orders.models import Order, OrderItem, PromoCode
from apps.products.models import Favorite, Product, StockSubscription

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _fresh_throttle():
    from django.core.cache import cache

    cache.clear()


def client_for(user):
    c = APIClient()
    c.force_authenticate(user)
    return c


# -- stock / price alerts ---------------------------------------------------------
def test_back_in_stock_notifies_and_clears(user, shop, django_capture_on_commit_callbacks):
    store, product = shop
    product.stock = 0
    product.save()
    api = client_for(user)
    assert api.put(f"/api/v1/products/{product.pk}/notify-stock").status_code == 204
    assert api.get("/api/v1/products/stock-alerts").json() == {"ids": [product.pk]}
    with django_capture_on_commit_callbacks(execute=True):
        product.stock = 4
        product.save()
    assert Notification.objects.filter(user=user, title__contains="yana sotuvda").exists()
    assert not StockSubscription.objects.exists()


def test_price_drop_notifies_favoriters(user, shop, django_capture_on_commit_callbacks):
    store, product = shop
    Favorite.objects.create(user=user, product=product)
    with django_capture_on_commit_callbacks(execute=True):
        product.price = "8.00"
        product.save()
    assert Notification.objects.filter(user=user, title__contains="arzonlashdi").exists()


def test_low_stock_alerts_seller_once(shop, django_capture_on_commit_callbacks):
    store, product = shop  # stock 5, threshold 5 -> already at threshold
    product.stock = 9
    product.save()
    with django_capture_on_commit_callbacks(execute=True):
        product.stock = 3
        product.save()
    with django_capture_on_commit_callbacks(execute=True):
        product.stock = 2  # still low: no second alert
        product.save()
    n = Notification.objects.filter(user=store.owner, title__contains="Zaxira kam").count()
    assert n == 1


def test_cancel_restock_wakes_subscribers(user, shop, address, django_capture_on_commit_callbacks):
    from apps.orders.services import CancelOrderService

    store, product = shop
    product.stock = 0
    product.save()
    order = Order.objects.create(
        customer=user, store=store, address=address, delivery_price="0", subtotal="10", total="10"
    )
    OrderItem.objects.create(order=order, product=product, price="10", quantity=1, subtotal="10")
    StockSubscription.objects.create(user=user, product=product)
    with django_capture_on_commit_callbacks(execute=True):
        CancelOrderService.execute(order=order, actor=user)
    assert Notification.objects.filter(user=user, title__contains="yana sotuvda").exists()


# -- order timeline / reorder / print -----------------------------------------------
def test_timeline_and_reorder(user, shop, address):
    store, product = shop
    order = Order.objects.create(
        customer=user, store=store, address=address, delivery_price="0", subtotal="20", total="20"
    )
    OrderItem.objects.create(order=order, product=product, price="10", quantity=2, subtotal="20")
    order.status = "ACCEPTED"
    order.save()
    api = client_for(user)
    detail = api.get(f"/api/v1/orders/{order.pk}").json()
    assert [e["status"] for e in detail["timeline"]] == ["PENDING", "ACCEPTED"]
    r = api.post(f"/api/v1/orders/{order.pk}/reorder").json()
    assert r["added"] == ["Plov"] and r["skipped"] == []
    product.status = "DRAFT"
    product.save()
    r = api.post(f"/api/v1/orders/{order.pk}/reorder").json()
    assert r["added"] == [] and r["skipped"][0]["name"] == "Plov"


def test_print_slip_only_for_own_store(user, shop, address):
    store, product = shop
    order = Order.objects.create(
        customer=user, store=store, address=address, delivery_price="0", subtotal="10", total="10",
        note="<script>x</script>",
    )
    OrderItem.objects.create(order=order, product=product, price="10", quantity=1, subtotal="10")
    res = client_for(store.owner).get(f"/api/v1/orders/{order.pk}/print")
    assert res.status_code == 200 and b"Plov" in res.content
    assert b"<script>x" not in res.content  # escaped
    assert client_for(user).get(f"/api/v1/orders/{order.pk}/print").status_code == 403


# -- CSV import / export ----------------------------------------------------------
def _csv(text):
    return SimpleUploadedFile("p.csv", text.encode("utf-8"), content_type="text/csv")


def test_csv_import_creates_updates_and_reports(shop):
    store, product = shop
    api = client_for(store.owner)
    data = (
        "sku,name,category,price,old_price,stock,description\n"
        "A1,Lagman,Food,15000,,10,Yaxshi\n"
        "A2,Somsa,Nonexistent,5000,,3,\n"
        "A3,Manti,Food,xx,,3,\n"
        "P1,Plov,Food,12000,,7,\n"
    )
    res = api.post("/api/v1/products/my/import", {"file": _csv(data)}, format="multipart").json()
    assert res["created"] == 1 and res["updated"] == 1
    assert {e["line"] for e in res["errors"]} == {3, 4}
    assert Product.objects.get(name="Lagman").status == "DRAFT"
    product.refresh_from_db()
    assert float(product.price) == 12000 and product.stock == 7 and product.sku == "P1"


def test_csv_import_semicolon_and_export(shop):
    store, _ = shop
    api = client_for(store.owner)
    data = "name;category;price\nUzum;Food;3000\n"
    res = api.post("/api/v1/products/my/import", {"file": _csv(data)}, format="multipart").json()
    assert res["created"] == 1
    out = api.get("/api/v1/products/my/export")
    assert out.status_code == 200 and b"Uzum" in out.content and b"Plov" in out.content


def test_csv_import_rejects_non_seller(user):
    res = client_for(user).post(
        "/api/v1/products/my/import", {"file": _csv("name\nx\n")}, format="multipart"
    )
    assert res.status_code == 403


# -- review replies ---------------------------------------------------------------
def test_product_review_reply(user, shop):
    from apps.products.models import ProductReview

    store, product = shop
    review = ProductReview.objects.create(product=product, customer=user, rating=5, comment="ok")
    res = client_for(store.owner).post(
        f"/api/v1/product-reviews/{review.pk}/reply", {"reply": "Rahmat!"}, format="json"
    )
    assert res.status_code == 200
    listed = APIClient().get(f"/api/v1/products/{product.pk}/reviews").json()
    assert listed["results"][0]["seller_reply"] == "Rahmat!"
    assert client_for(user).post(
        f"/api/v1/product-reviews/{review.pk}/reply", {"reply": "x"}, format="json"
    ).status_code == 403


# -- seller promo codes -----------------------------------------------------------
def test_seller_promo_crud_scoped(shop, staff):
    store, _ = shop
    api = client_for(store.owner)
    body = {"code": "yoz10", "kind": "PERCENT", "value": "10"}
    res = api.post("/api/v1/stores/my/promo-codes", body, format="json")
    assert res.status_code == 201, res.content
    promo = PromoCode.objects.get(code="YOZ10")
    assert promo.store_id == store.pk
    assert api.post("/api/v1/stores/my/promo-codes", body, format="json").status_code == 400
    other = PromoCode.objects.create(code="OTHER", kind="PERCENT", value=5)
    res = api.patch(f"/api/v1/stores/my/promo-codes/{other.pk}", {}, format="json")
    assert res.status_code == 404
    assert api.delete(f"/api/v1/stores/my/promo-codes/{promo.pk}").status_code == 204


# -- stores: nearby / open ----------------------------------------------------------
def test_nearby_stores_sorted_by_distance(shop):
    store, _ = shop
    store.latitude, store.longitude = "41.311000", "69.279000"  # Tashkent
    store.save()
    owner2 = get_user_model().objects.create_user(phone="+998900000060", password="pw12345678")
    far = store.__class__.objects.create(
        owner=owner2, name="Far", phone="+998900000060", status="ACTIVE",
        latitude="39.654000", longitude="66.975000",  # Samarkand
    )
    res = APIClient().get("/api/v1/stores?lat=39.65&lng=66.97").json()
    assert [s["id"] for s in res["results"][:2]] == [far.pk, store.pk]
    assert res["results"][0]["distance_km"] < 2


def test_store_is_open_logic():
    from datetime import time

    from apps.stores.models import Store

    s = Store(opens_at=None, closes_at=None)
    assert s.is_open is None
    s = Store(opens_at=time(0, 0), closes_at=time(23, 59, 59))
    assert s.is_open is True


# -- Open Graph share --------------------------------------------------------------
def test_share_product_has_og_tags(shop, settings):
    store, product = shop
    settings.FRONTEND_BASE_URL = "https://shop.pages.dev"
    res = APIClient().get(f"/share/products/{product.pk}")
    body = res.content.decode()
    assert res.status_code == 200
    assert 'property="og:title" content="Plov"' in body
    assert "https://shop.pages.dev/mahsulot/" in body
    product.status = "DRAFT"
    product.save()
    assert APIClient().get(f"/share/products/{product.pk}").status_code == 404


# -- password reset ----------------------------------------------------------------
def test_password_reset_flow(user, sent):
    TelegramAccount.objects.create(user=user, telegram_id="777", username="ali")
    api = APIClient()
    first = api.post("/api/v1/auth/password-reset", {"phone": user.phone}, format="json")
    assert first.status_code == 200
    chat, text = sent[-1]
    assert chat == "777"
    code = text.split("<b>")[1].split("</b>")[0]
    bad = api.post(
        "/api/v1/auth/password-reset/confirm",
        {"phone": user.phone, "code": "000000" if code != "000000" else "111111",
         "new_password": "NewPass123"},
        format="json",
    )
    assert bad.status_code == 400
    ok = api.post(
        "/api/v1/auth/password-reset/confirm",
        {"phone": user.phone, "code": code, "new_password": "NewPass123"},
        format="json",
    )
    assert ok.status_code == 200
    user.refresh_from_db()
    assert user.check_password("NewPass123")
    reuse = api.post(
        "/api/v1/auth/password-reset/confirm",
        {"phone": user.phone, "code": code, "new_password": "Another12345"},
        format="json",
    )
    assert reuse.status_code == 400


def test_password_reset_no_enumeration(sent):
    res = APIClient().post(
        "/api/v1/auth/password-reset", {"phone": "+998911111111"}, format="json"
    )
    assert res.status_code == 200 and sent == []


def test_password_reset_locks_after_attempts(user, sent):
    TelegramAccount.objects.create(user=user, telegram_id="777", username="ali")
    api = APIClient()
    api.post("/api/v1/auth/password-reset", {"phone": user.phone}, format="json")
    code = sent[-1][1].split("<b>")[1].split("</b>")[0]
    wrong = "999999" if code != "999999" else "888888"
    for _ in range(5):
        api.post(
            "/api/v1/auth/password-reset/confirm",
            {"phone": user.phone, "code": wrong, "new_password": "NewPass123"},
            format="json",
        )
    res = api.post(
        "/api/v1/auth/password-reset/confirm",
        {"phone": user.phone, "code": code, "new_password": "NewPass123"},
        format="json",
    )
    assert res.status_code == 400


def test_seller_reviews_list(user, shop):
    from apps.products.models import ProductReview

    store, product = shop
    ProductReview.objects.create(product=product, customer=user, rating=4, comment="yaxshi")
    res = client_for(store.owner).get("/api/v1/reviews/my").json()
    assert res["results"][0]["title"] == "Plov" and res["results"][0]["kind"] == "product"
    assert client_for(user).get("/api/v1/reviews/my").status_code == 403
