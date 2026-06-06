from typing import Any

from django.db import transaction
from django.db.models import Max

from apps.accounts.models import User
from apps.products.exceptions import (
    MaxImagesError,
    NotProductOwnerError,
    ProductNotFound,
)
from apps.products.models import Product, ProductImage

MAX_IMAGES_PER_PRODUCT = 5


class UploadProductImageService:
    """Upload an image for a product.

    Business rules:
    - Only the product's store owner may upload images.
    - At most 5 images per product (uploading the 6th is forbidden).
    - The first image uploaded becomes primary automatically.
    - Exactly one primary image: if the new image is marked primary, any
      existing primary is demoted.
    """

    @staticmethod
    @transaction.atomic
    def execute(
        *,
        product: Product,
        actor: User,
        image: Any,
        is_primary: bool = False,
        sort_order: int | None = None,
    ) -> ProductImage:
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

        existing = list(
            ProductImage.objects.select_for_update().filter(product=locked)
        )
        if len(existing) >= MAX_IMAGES_PER_PRODUCT:
            raise MaxImagesError()

        is_first_image = len(existing) == 0
        make_primary = is_primary or is_first_image

        if make_primary and not is_first_image:
            ProductImage.objects.filter(
                product=locked,
                is_primary=True,
            ).update(is_primary=False)

        if sort_order is None:
            current_max = (
                ProductImage.objects.filter(product=locked)
                .aggregate(value=Max("sort_order"))
                .get("value")
            )
            sort_order = 0 if current_max is None else current_max + 1

        return ProductImage.objects.create(
            product=locked,
            image=image,
            is_primary=make_primary,
            sort_order=sort_order,
        )
