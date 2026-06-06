from django.db import transaction

from apps.accounts.models import User
from apps.products.exceptions import (
    MinImagesError,
    NotProductOwnerError,
    ProductImageNotFound,
)
from apps.products.models import ProductImage


class DeleteProductImageService:
    """Delete a product image.

    Business rules:
    - Only the product's store owner may delete images.
    - A product must keep at least 1 image (deleting the last is forbidden).
    - Exactly one primary image: if the primary is deleted, another image is
      promoted to primary automatically.
    """

    @staticmethod
    @transaction.atomic
    def execute(*, image: ProductImage, actor: User) -> None:
        locked = (
            ProductImage.objects.select_for_update()
            .select_related("product", "product__store")
            .filter(pk=image.pk)
            .first()
        )
        if locked is None:
            raise ProductImageNotFound()

        if locked.product.store.owner_id != actor.pk:
            raise NotProductOwnerError()

        product_id = locked.product_id
        remaining = list(
            ProductImage.objects.select_for_update()
            .filter(product_id=product_id)
            .exclude(pk=locked.pk)
            .order_by("sort_order")
        )
        if not remaining:
            raise MinImagesError()

        was_primary = locked.is_primary
        locked.delete()

        if was_primary:
            new_primary = remaining[0]
            new_primary.is_primary = True
            new_primary.save(update_fields=["is_primary", "updated_at"])
