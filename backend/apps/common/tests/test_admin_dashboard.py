import pytest
from django.urls import reverse

pytestmark = pytest.mark.django_db


def test_dashboard_renders_with_pending_application(client, staff, application):
    client.force_login(staff)
    resp = client.get(reverse("admin:index"))
    assert resp.status_code == 200
    html = resp.content.decode()
    assert "Kutilayotgan arizalar" in html
    assert application.store_name in html  # listed in the "waiting for review" card


def test_dashboard_renders_empty(client, staff):
    client.force_login(staff)
    assert client.get(reverse("admin:index")).status_code == 200


def test_all_registered_admin_pages_load(client, staff):
    client.force_login(staff)
    for name in (
        "admin:stores_store_changelist",
        "admin:stores_storeapplication_changelist",
        "admin:orders_order_changelist",
        "admin:products_product_changelist",
        "admin:accounts_user_changelist",
        "admin:banners_banner_changelist",
    ):
        assert client.get(reverse(name)).status_code == 200, name
