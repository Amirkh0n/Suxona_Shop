from django.db import IntegrityError, transaction

from apps.accounts.models import User
from apps.products.exceptions import (
    DuplicateProductVariantError,
    InvalidProductVariantError,
    NotProductOwnerError,
    ProductNotFound,
)
from apps.products.models import Product, ProductVariant


class CreateProductVariantService:
    @staticmethod
    @transaction.atomic
    def execute(
        *,
        product: Product,
        actor: User,
        sku: str,
        attributes: dict,
        price=None,
        stock: int | None = None,
        is_active: bool = True,
    ) -> ProductVariant:
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
        if not isinstance(attributes, dict) or not attributes:
            raise InvalidProductVariantError()

        try:
            return ProductVariant.objects.create(
                product=locked_product,
                sku=sku,
                attributes=attributes,
                price=price,
                stock=stock,
                is_active=is_active,
            )
        except IntegrityError as exc:
            raise DuplicateProductVariantError() from exc
