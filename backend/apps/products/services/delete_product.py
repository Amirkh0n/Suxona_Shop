from django.db import transaction

from apps.accounts.models import User
from apps.products.exceptions import NotProductOwnerError, ProductNotFound
from apps.products.models import Product


class DeleteProductService:
    """Delete a product.

    Business rules:
    - Only the product's store owner may delete it.
    """

    @staticmethod
    @transaction.atomic
    def execute(*, product: Product, actor: User) -> None:
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

        locked.delete()
