from django.db import transaction

from apps.accounts.models import User
from apps.products.exceptions import NotProductOwnerError, ProductVariantNotFound
from apps.products.models import ProductVariant


class DeleteProductVariantService:
    @staticmethod
    @transaction.atomic
    def execute(*, variant: ProductVariant, actor: User) -> None:
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
        locked.delete()
