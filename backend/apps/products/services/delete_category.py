from django.db import transaction
from django.db.models import ProtectedError

from apps.products.exceptions import (
    CategoryHasChildrenError,
    CategoryInUseError,
    CategoryNotFound,
)
from apps.products.models import Category, Product


class DeleteCategoryService:
    """Delete a category (admin-managed entity).

    Business rules:
    - Cannot delete a category that has child categories.
    - Cannot delete a category referenced by products.
    """

    @staticmethod
    @transaction.atomic
    def execute(*, category: Category) -> None:
        locked = Category.objects.select_for_update().filter(pk=category.pk).first()
        if locked is None:
            raise CategoryNotFound()

        if Category.objects.filter(parent_id=locked.pk).exists():
            raise CategoryHasChildrenError()

        if Product.objects.filter(category_id=locked.pk).exists():
            raise CategoryInUseError()

        try:
            locked.delete()
        except ProtectedError as exc:
            # Defensive: the Product.category FK uses PROTECT.
            raise CategoryInUseError() from exc
