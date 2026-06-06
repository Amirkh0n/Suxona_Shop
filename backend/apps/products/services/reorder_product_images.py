from collections.abc import Sequence

from django.db import transaction

from apps.accounts.models import User
from apps.products.exceptions import (
    InvalidImageOrderError,
    NotProductOwnerError,
    ProductNotFound,
)
from apps.products.models import Product, ProductImage


class ReorderProductImagesService:
    """Reorder a product's images.

    Business rules:
    - Only the product's store owner may reorder images.
    - The submitted id list must match the product's complete image set
      exactly: no missing ids, no extra ids, no duplicates.
    - sort_order is reassigned to match the submitted order (0-based).
    """

    @staticmethod
    @transaction.atomic
    def execute(
        *,
        product: Product,
        actor: User,
        image_ids: Sequence[int],
    ) -> list[ProductImage]:
        locked_product = (
            Product.objects.select_for_update()
            .select_related("store")
            .filter(pk=product.pk)
            .first()
        )
        if locked_product is None:
            raise ProductNotFound()

        if locked_product.store.owner_id != actor.pk:
            raise NotProductOwnerError()

        images = list(
            ProductImage.objects.select_for_update().filter(product=locked_product)
        )
        existing_ids = {img.pk for img in images}

        submitted_ids = list(image_ids)
        if len(submitted_ids) != len(set(submitted_ids)):
            raise InvalidImageOrderError()
        if set(submitted_ids) != existing_ids:
            raise InvalidImageOrderError()

        images_by_id = {img.pk: img for img in images}

        # Two-pass reassignment to avoid transient collisions on the
        # unique (product, sort_order) constraint. First move every row to a
        # disjoint temporary range, then assign the final 0-based order.
        offset = len(submitted_ids)
        for index, image in enumerate(images):
            image.sort_order = offset + index
            image.save(update_fields=["sort_order", "updated_at"])

        ordered: list[ProductImage] = []
        for position, image_id in enumerate(submitted_ids):
            image = images_by_id[image_id]
            image.sort_order = position
            image.save(update_fields=["sort_order", "updated_at"])
            ordered.append(image)

        return ordered
