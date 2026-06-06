from typing import Any

from django.db import IntegrityError, transaction

from apps.products.exceptions import (
    CategoryNotFound,
    DuplicateCategoryError,
)
from apps.products.models import Category


class CreateCategoryService:
    """Create a category (admin-managed entity).

    Business rules:
    - Root categories (no parent) must have a unique name.
    - Child categories must have a unique name within their parent.
    """

    @staticmethod
    @transaction.atomic
    def execute(
        *,
        name: str,
        parent_id: int | None = None,
        icon: Any = None,
        is_active: bool = True,
    ) -> Category:
        if parent_id is not None and not Category.objects.filter(pk=parent_id).exists():
            raise CategoryNotFound()

        duplicate = Category.objects.filter(name=name, parent_id=parent_id).exists()
        if duplicate:
            raise DuplicateCategoryError()

        try:
            category = Category.objects.create(
                name=name,
                parent_id=parent_id,
                is_active=is_active,
                **({"icon": icon} if icon is not None else {}),
            )
        except IntegrityError as exc:
            raise DuplicateCategoryError() from exc

        return category
