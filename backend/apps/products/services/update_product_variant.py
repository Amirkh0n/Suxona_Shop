from django.db import IntegrityError, transaction

from apps.accounts.models import User
from apps.products.exceptions import (
    DuplicateProductVariantError,
    InvalidProductVariantError,
    NotProductOwnerError,
    ProductVariantNotFound,
)
from apps.products.models import ProductVariant


class UpdateProductVariantService:
    @staticmethod
    @transaction.atomic
    def execute(*, variant: ProductVariant, actor: User, **fields) -> ProductVariant:
        locked = (
            ProductVariant.objects.select_for_update()
            .select_related("product__store")
            .filter(pk=variant.pk)
            .first()
        )
        if locked is None:
            raise ProductVariantNotFound()
        if locked.product.store.owner_id != actor.pk:
            raise NotProductOwnerError()
        if "attributes" in fields and (
            not isinstance(fields["attributes"], dict) or not fields["attributes"]
        ):
            raise InvalidProductVariantError()

        update_fields = []
        for field in ("sku", "attributes", "price", "stock", "is_active"):
            if field in fields:
                setattr(locked, field, fields[field])
                update_fields.append(field)
        if update_fields:
            update_fields.append("updated_at")
            try:
                locked.save(update_fields=update_fields)
            except IntegrityError as exc:
                raise DuplicateProductVariantError() from exc
        return locked
