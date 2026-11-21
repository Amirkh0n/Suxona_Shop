from decimal import Decimal

from django.db import IntegrityError, transaction

from apps.accounts.models import User
from apps.common.enums import ProductStatus, StoreStatus
from apps.products.exceptions import (
    CategoryNotFound,
    DuplicateProductError,
    InvalidDiscountError,
    NotProductOwnerError,
    StoreNotActiveError,
    StoreNotFound,
)
from apps.products.models import Category, Product
from apps.stores.models import Store


class CreateProductService:
    """Create a product for a store.

    Business rules:
    - Only the store owner may create products for the store.
    - The store must be ACTIVE.
    - The category must exist.
    - New products start in DRAFT status.
    """

    @staticmethod
    @transaction.atomic
    def execute(
        *,
        store: Store,
        actor: User,
        category_id: int,
        name: str,
        price: Decimal,
        description: str = "",
        stock: int | None = None,
        old_price: Decimal | None = None,
        sku: str = "",
        low_stock_threshold: int = 5,
    ) -> Product:
        locked_store = Store.objects.select_for_update().filter(pk=store.pk).first()
        if locked_store is None:
            raise StoreNotFound()

        if locked_store.owner_id != actor.pk:
            raise NotProductOwnerError()

        if locked_store.status != StoreStatus.ACTIVE:
            raise StoreNotActiveError()

        if not Category.objects.filter(pk=category_id).exists():
            raise CategoryNotFound()

        if old_price is not None and old_price <= price:
            raise InvalidDiscountError()

        try:
            return Product.objects.create(
                store=locked_store,
                category_id=category_id,
                name=name,
                description=description,
                price=price,
                old_price=old_price,
                stock=stock,
                sku=sku,
                low_stock_threshold=low_stock_threshold,
                status=ProductStatus.DRAFT,
            )
        except IntegrityError as exc:
            raise DuplicateProductError() from exc
