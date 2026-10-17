from django.db import transaction

from apps.accounts.models import User
from apps.common.enums import ProductStatus
from apps.orders.exceptions import (
    CartItemNotFound,
    InsufficientStockError,
    InvalidQuantityError,
    NotCartOwnerError,
    ProductNotPurchasable,
    ProductVariantNotPurchasable,
)
from apps.orders.models import CartItem


class UpdateCartItemService:
    """Update the quantity of a cart item.

    Business rules:
    - quantity must be > 0.
    - A user may modify only items in their own cart.
    """

    @staticmethod
    @transaction.atomic
    def execute(*, user: User, cart_item: CartItem, quantity: int) -> CartItem:
        if quantity <= 0:
            raise InvalidQuantityError()

        item = (
            CartItem.objects.select_for_update()
            .select_related("cart", "product", "variant")
            .filter(pk=cart_item.pk)
            .first()
        )
        if item is None:
            raise CartItemNotFound()

        if item.cart.user_id != user.pk:
            raise NotCartOwnerError()

        if item.product.status != ProductStatus.ACTIVE:
            raise ProductNotPurchasable()
        if item.variant is not None and not item.variant.is_active:
            raise ProductVariantNotPurchasable()

        available_stock = (
            item.variant.stock if item.variant is not None else item.product.stock
        )
        if available_stock is not None and available_stock < quantity:
            raise InsufficientStockError()

        item.quantity = quantity
        item.save(update_fields=["quantity", "updated_at"])
        return item
