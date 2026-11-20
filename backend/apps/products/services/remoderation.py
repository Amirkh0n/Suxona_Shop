from apps.common.audit import record
from apps.common.enums import ProductStatus
from apps.notifications.telegram.services import after_commit, notify_admins_product_review
from apps.products.models import Product

# Editing any of these on a live product changes what shoppers see in a way the
# moderator approved, so the product goes back through review.
MODERATED_FIELDS = ("name", "description", "category_id")


def send_back_to_review(product: Product, actor, reason: str) -> list[str]:
    """If ``product`` is live, move it to PENDING_REVIEW; return the fields to save.

    Must be called inside the caller's transaction with the product row locked.
    Drafts, hidden, rejected and already-pending products are left alone.
    """
    if product.status != ProductStatus.ACTIVE or product.approved_at is None:
        return []
    product.status = ProductStatus.PENDING_REVIEW
    product.moderation_note = ""
    record(actor, "product.remoderate", product, reason)
    after_commit(notify_admins_product_review, product_id=product.pk)
    return ["status", "moderation_note"]
