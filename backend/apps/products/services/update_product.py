from typing import Any

from django.db import transaction

from apps.accounts.models import User
from apps.common.enums import ProductStatus
from apps.products.exceptions import (
    CategoryNotFound,
    InvalidProductStatusError,
    NotProductOwnerError,
    ProductNotFound,
)
from apps.products.models import Category, Product


class UpdateProductService:
    """Update a product.

    Business rules:
    - Only the product's store owner may update it.
    - The category, when changed, must exist.
    - status, when provided, must be a valid ProductStatus value.
    """

    SCALAR_FIELDS = ("name", "description", "price", "stock")

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
            locked.status = status_value
            update_fields.append("status")

        if update_fields:
            update_fields.append("updated_at")
            locked.save(update_fields=update_fields)

        return locked
