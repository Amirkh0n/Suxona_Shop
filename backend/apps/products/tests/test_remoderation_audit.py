import pytest
from rest_framework.test import APIClient

from apps.common.models import AuditLog
from apps.products.models import Product
from apps.products.services.moderate_product import ApproveProductService, RejectProductService

pytestmark = pytest.mark.django_db


@pytest.fixture
def live(shop):
    """An approved, live product with one image."""
    from django.utils import timezone

    from apps.products.models import ProductImage

    store, product = shop
    product.approved_at = timezone.now()
    product.save()
    ProductImage.objects.create(product=product, image="x.webp", is_primary=True)
    client = APIClient()
    client.force_authenticate(store.owner)
    return client, product


def test_editing_name_sends_live_product_back_to_review(live, sent):
    client, product = live
    r = client.patch(f"/api/v1/products/{product.pk}", {"name": "Yangi nom"}, format="json")
    assert r.status_code == 200, r.data
    product.refresh_from_db()
    assert product.status == "PENDING_REVIEW"
    assert AuditLog.objects.filter(action="product.remoderate", target_id=str(product.pk)).exists()
    # no longer visible to shoppers
    assert APIClient().get(f"/api/v1/products/{product.pk}").status_code == 404


def test_price_and_stock_edits_stay_live(live):
    client, product = live
    r = client.patch(
        f"/api/v1/products/{product.pk}", {"price": "11.00", "stock": 9}, format="json"
    )
    assert r.status_code == 200
    product.refresh_from_db()
    assert product.status == "ACTIVE"


def test_same_name_is_not_a_change(live):
    client, product = live
    client.patch(f"/api/v1/products/{product.pk}", {"name": product.name}, format="json")
    product.refresh_from_db()
    assert product.status == "ACTIVE"


def test_unapproved_drafts_are_not_touched(shop):
    store, product = shop
    product.status = "DRAFT"
    product.save()
    client = APIClient()
    client.force_authenticate(store.owner)
    client.patch(f"/api/v1/products/{product.pk}", {"name": "Boshqa"}, format="json")
    product.refresh_from_db()
    assert product.status == "DRAFT"


def test_moderation_decisions_are_audited(shop, staff):
    store, product = shop
    Product.objects.filter(pk=product.pk).update(status="PENDING_REVIEW")
    product.refresh_from_db()
    ApproveProductService.execute(product=product, reviewed_by=staff)
    Product.objects.filter(pk=product.pk).update(status="PENDING_REVIEW")
    product.refresh_from_db()
    RejectProductService.execute(product=product, note="blur", reviewed_by=staff)
    actions = list(AuditLog.objects.values_list("action", flat=True))
    assert "product.approve" in actions and "product.reject" in actions
    assert AuditLog.objects.get(action="product.reject").summary.endswith("blur")
