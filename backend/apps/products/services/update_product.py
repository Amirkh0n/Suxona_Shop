from typing import Any

from django.db import IntegrityError, transaction

from apps.accounts.models import User
from apps.common.enums import ProductStatus
from apps.notifications.telegram.services import after_commit, notify_admins_product_review
from apps.products.exceptions import (
    CategoryNotFound,
    DuplicateProductError,
    InvalidProductStatusError,
    NotProductOwnerError,
    ProductNeedsImageError,
    ProductNotApprovedError,
    ProductNotFound,
    ProductStatusForbiddenError,
)
from apps.products.models import Category, Product


class UpdateProductService:
    """Update a product.

    Business rules:
    - Only the product's store owner may update it.
    - The category, when changed, must exist.
    - status, when provided, must be a valid ProductStatus value.
    - Moderation: a seller can never set ACTIVE on a product that has not been
      approved; they submit it with PENDING_REVIEW (needs >=1 image) and an
      admin decides. REJECTED is admin-only. Once approved, the seller may
      hide/show it freely (approved_at stays set).
    """

    SCALAR_FIELDS = ("name", "description", "price", "stock")

    @staticmethod
    def _check_seller_status(product: Product, target: str) -> None:
        if target == ProductStatus.REJECTED:
            raise ProductStatusForbiddenError()
        if target == ProductStatus.PENDING_REVIEW:
            if not product.images.exists():
                raise ProductNeedsImageError()
        elif target == ProductStatus.ACTIVE:
            # Pending/rejected products must wait for (re)review even if they
            # were approved once, otherwise a rejection could be bypassed.
            if product.approved_at is None or product.status in (
                ProductStatus.PENDING_REVIEW,
                ProductStatus.REJECTED,
            ):
                raise ProductNotApprovedError()

    @staticmethod
    @transaction.atomic
    def execute(*, product: Product, actor: User, **fields: Any) -> Product:
        locked = (
            Product.objects.select_for_update()
            .select_related("store")
            .filter(pk=product.pk)
            .first()
        )
        if locked is None:
            raise ProductNotFound()

        if locked.store.owner_id != actor.pk:
            raise NotProductOwnerError()

        update_fields: list[str] = []

        category_id = fields.get("category_id")
        if category_id is not None:
            if not Category.objects.filter(pk=category_id).exists():
                raise CategoryNotFound()
            locked.category_id = category_id
            update_fields.append("category")

        for field in UpdateProductService.SCALAR_FIELDS:
            if field in fields and fields[field] is not None:
                setattr(locked, field, fields[field])
                update_fields.append(field)

        status_value = fields.get("status")
        if status_value is not None:
            if status_value not in ProductStatus.values:
                raise InvalidProductStatusError()
            if status_value != locked.status:
                UpdateProductService._check_seller_status(locked, status_value)
                locked.status = status_value
                update_fields.append("status")
                if status_value == ProductStatus.PENDING_REVIEW:
                    locked.moderation_note = ""
                    update_fields.append("moderation_note")
                    after_commit(notify_admins_product_review, product_id=locked.pk)

        if update_fields:
            update_fields.append("updated_at")
            try:
                locked.save(update_fields=update_fields)
            except IntegrityError as exc:
                raise DuplicateProductError() from exc

        return locked
