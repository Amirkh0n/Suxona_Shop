from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.common.enums import ProductStatus
from apps.notifications.telegram.services import after_commit, notify_seller_product_moderated
from apps.products.exceptions import ProductNotFound, ProductNotPendingReviewError
from apps.products.models import Product


def _lock_pending(product: Product) -> Product:
    locked = Product.objects.select_for_update().filter(pk=product.pk).first()
    if locked is None:
        raise ProductNotFound()
    if locked.status != ProductStatus.PENDING_REVIEW:
        raise ProductNotPendingReviewError()
    return locked


class ApproveProductService:
    """Admin approves a product that is PENDING_REVIEW: it goes live."""

    @staticmethod
    @transaction.atomic
    def execute(*, product: Product, reviewed_by: User | None = None) -> Product:
        locked = _lock_pending(product)
        now = timezone.now()
        locked.status = ProductStatus.ACTIVE
        locked.approved_at = locked.approved_at or now
        locked.reviewed_by = reviewed_by
        locked.reviewed_at = now
        locked.moderation_note = ""
        locked.save(
            update_fields=[
                "status", "approved_at", "reviewed_by", "reviewed_at",
                "moderation_note", "updated_at",
            ]
        )
        after_commit(notify_seller_product_moderated, product_id=locked.pk)
        return locked


class RejectProductService:
    """Admin rejects a PENDING_REVIEW product; the reason is sent to the seller."""

    @staticmethod
    @transaction.atomic
    def execute(
        *, product: Product, note: str = "", reviewed_by: User | None = None
    ) -> Product:
        locked = _lock_pending(product)
        locked.status = ProductStatus.REJECTED
        locked.reviewed_by = reviewed_by
        locked.reviewed_at = timezone.now()
        locked.moderation_note = note
        locked.save(
            update_fields=[
                "status", "reviewed_by", "reviewed_at", "moderation_note", "updated_at",
            ]
        )
        after_commit(notify_seller_product_moderated, product_id=locked.pk)
        return locked
