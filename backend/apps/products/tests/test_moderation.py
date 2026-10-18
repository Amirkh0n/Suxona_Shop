import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from apps.common.enums import ProductStatus as PS
from apps.products.exceptions import (
    ProductNeedsImageError,
    ProductNotApprovedError,
    ProductNotPendingReviewError,
    ProductStatusForbiddenError,
)
from apps.products.models import Product, ProductImage
from apps.products.services import (
    ApproveProductService,
    RejectProductService,
    UpdateProductService,
)

pytestmark = pytest.mark.django_db(transaction=True)


@pytest.fixture
def draft(shop):
    store, product = shop
    Product.objects.filter(pk=product.pk).update(status=PS.DRAFT, approved_at=None)
    product.refresh_from_db()
    return product


def _image(product):
    buf = io.BytesIO()
    Image.new("RGB", (4, 4)).save(buf, "PNG")
    return ProductImage.objects.create(
        product=product, image=SimpleUploadedFile("a.png", buf.getvalue()), is_primary=True
    )


def test_seller_cannot_self_activate_unapproved_product(draft):
    with pytest.raises(ProductNotApprovedError):
        UpdateProductService.execute(product=draft, actor=draft.store.owner, status=PS.ACTIVE)


def test_seller_cannot_set_rejected(draft):
    with pytest.raises(ProductStatusForbiddenError):
        UpdateProductService.execute(product=draft, actor=draft.store.owner, status=PS.REJECTED)


def test_submit_needs_an_image(draft):
    with pytest.raises(ProductNeedsImageError):
        UpdateProductService.execute(
            product=draft, actor=draft.store.owner, status=PS.PENDING_REVIEW
        )


def test_submit_then_approve_goes_live_and_notifies(draft, staff, sent, settings):
    settings.TELEGRAM_ADMIN_CHAT_ID = "999"
    from apps.accounts.models import TelegramAccount

    TelegramAccount.objects.create(user=draft.store.owner, telegram_id="900")
    _image(draft)

    UpdateProductService.execute(product=draft, actor=draft.store.owner, status=PS.PENDING_REVIEW)
    assert [m[0] for m in sent] == ["999"]  # admins told

    done = ApproveProductService.execute(product=draft, reviewed_by=staff)
    assert done.status == PS.ACTIVE and done.approved_at and done.reviewed_by == staff
    assert sent[-1][0] == "900" and "tasdiqlandi" in sent[-1][1]


def test_reject_carries_reason_and_blocks_self_activation(draft, staff, sent):
    from apps.accounts.models import TelegramAccount

    TelegramAccount.objects.create(user=draft.store.owner, telegram_id="900")
    _image(draft)
    UpdateProductService.execute(product=draft, actor=draft.store.owner, status=PS.PENDING_REVIEW)
    out = RejectProductService.execute(product=draft, note="Rasm xira <b>", reviewed_by=staff)
    assert out.status == PS.REJECTED and out.moderation_note == "Rasm xira <b>"
    assert "Rasm xira &lt;b&gt;" in sent[-1][1]
    with pytest.raises(ProductNotApprovedError):
        UpdateProductService.execute(product=out, actor=out.store.owner, status=PS.ACTIVE)
    # fix and resubmit clears the old note
    again = UpdateProductService.execute(
        product=out, actor=out.store.owner, status=PS.PENDING_REVIEW
    )
    assert again.moderation_note == ""


def test_moderating_a_non_pending_product_fails(draft, staff):
    with pytest.raises(ProductNotPendingReviewError):
        ApproveProductService.execute(product=draft, reviewed_by=staff)


def test_approved_product_can_be_hidden_and_reshown_without_review(draft, staff):
    _image(draft)
    owner = draft.store.owner
    UpdateProductService.execute(product=draft, actor=owner, status=PS.PENDING_REVIEW)
    ApproveProductService.execute(product=draft, reviewed_by=staff)
    UpdateProductService.execute(product=draft, actor=owner, status=PS.HIDDEN)
    back = UpdateProductService.execute(product=draft, actor=owner, status=PS.ACTIVE)
    assert back.status == PS.ACTIVE


def test_non_public_products_are_404_for_strangers_visible_to_owner_and_staff(draft, staff, user):
    url = f"/api/v1/products/{draft.pk}"
    anon, stranger, owner, admin = APIClient(), APIClient(), APIClient(), APIClient()
    stranger.force_authenticate(user)
    owner.force_authenticate(draft.store.owner)
    admin.force_authenticate(staff)

    assert anon.get(url).status_code == 404
    assert stranger.get(url).status_code == 404
    assert owner.get(url).status_code == 200
    assert admin.get(url).status_code == 200

    Product.objects.filter(pk=draft.pk).update(status=PS.ACTIVE, moderation_note="secret")
    public = anon.get(url)
    assert public.status_code == 200 and "moderation_note" not in public.data
    assert owner.get(url).data["moderation_note"] == "secret"


def test_admin_change_form_buttons(draft, staff):
    _image(draft)
    UpdateProductService.execute(product=draft, actor=draft.store.owner, status=PS.PENDING_REVIEW)
    c = APIClient()
    c.force_login(staff)
    url = f"/admin/products/product/{draft.pk}/change/"
    page = c.get(url)
    assert page.status_code == 200 and b"_approve" in page.content
    data = {
        "store": draft.store_id, "category": draft.category_id, "name": draft.name,
        "description": "", "price": "10.00", "stock": "5", "moderation_note": "",
        "images-TOTAL_FORMS": 0, "images-INITIAL_FORMS": 0,
        "variants-TOTAL_FORMS": 0, "variants-INITIAL_FORMS": 0,
        "_approve": "1",
    }
    r = c.post(url, data)
    assert r.status_code == 302
    draft.refresh_from_db()
    assert draft.status == PS.ACTIVE and draft.reviewed_by == staff
