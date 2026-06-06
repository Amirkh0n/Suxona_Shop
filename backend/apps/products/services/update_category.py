from typing import Any

from django.db import IntegrityError, transaction

from apps.products.exceptions import (
    CategoryNotFound,
    DuplicateCategoryError,
    InvalidCategoryParentError,
)
from apps.products.models import Category


class UpdateCategoryService:
    """Update a category (admin-managed entity).

    Business rules:
    - Name must remain unique within the (possibly new) parent level.
    - A category cannot be its own parent.
    """

    @staticmethod
    @transaction.atomic
    def execute(*, category: Category, **fields: Any) -> Category:
        locked = Category.objects.select_for_update().filter(pk=category.pk).first()
        if locked is None:
            raise CategoryNotFound()

        update_fields: list[str] = []

        if "parent_id" in fields:
            parent_id = fields["parent_id"]
            if parent_id is not None:
                if parent_id == locked.pk:
                    raise InvalidCategoryParentError()
                if not Category.objects.filter(pk=parent_id).exists():
                    raise CategoryNotFound()
            locked.parent_id = parent_id
            update_fields.append("parent")

        if fields.get("name") is not None:
            locked.name = fields["name"]
            update_fields.append("name")

        if fields.get("icon") is not None:
            locked.icon = fields["icon"]
            update_fields.append("icon")

        if fields.get("is_active") is not None:
            locked.is_active = fields["is_active"]
            update_fields.append("is_active")

        target_name = locked.name
        target_parent_id = locked.parent_id
        duplicate = (
            Category.objects.filter(name=target_name, parent_id=target_parent_id)
            .exclude(pk=locked.pk)
            .exists()
        )
        if duplicate:
            raise DuplicateCategoryError()

        if update_fields:
            update_fields.append("updated_at")
            try:
                locked.save(update_fields=update_fields)
            except IntegrityError as exc:
                raise DuplicateCategoryError() from exc

        return locked
