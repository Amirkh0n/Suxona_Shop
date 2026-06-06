from django.db import transaction

from apps.accounts.models import User
from apps.common.enums import ProductStatus
from apps.orders.exceptions import InvalidQuantityError, ProductNotPurchasable
from apps.orders.models import Cart, CartItem
from apps.products.models import Product


class AddCartItemService:
    """Add a product to the user's cart.

    Business rules:
    - One cart per user; the cart is created automatically if missing.
    - quantity must be > 0.
    - The product must exist and be ACTIVE.
    - A product is unique per cart: if it already exists, its quantity is
      incremented instead of creating a duplicate.
    """

    @staticmethod
    @transaction.atomic
    def execute(*, user: User, product_id: int, quantity: int) -> CartItem:
        if quantity <= 0:
            raise InvalidQuantityError()

        product = (
            Product.objects.filter(pk=product_id).only("id", "status").first()
        )
        if product is None or product.status != ProductStatus.ACTIVE:
            raise ProductNotPurchasable()

        cart, _created = Cart.objects.get_or_create(user=user)

        item = (
            CartItem.objects.select_for_update()
            .filter(cart=cart, product_id=product_id)
            .first()
        )
        if item is None:
            return CartItem.objects.create(
                cart=cart,
                product_id=product_id,
                quantity=quantity,
            )

        item.quantity += quantity
        item.save(update_fields=["quantity", "updated_at"])
        return item
