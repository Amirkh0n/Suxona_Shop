from django.db import transaction

from apps.accounts.models import User
from apps.common.enums import ProductStatus
from apps.orders.exceptions import (
    InsufficientStockError,
    InvalidQuantityError,
    ProductNotPurchasable,
    ProductVariantMismatchError,
    ProductVariantNotPurchasable,
)
from apps.orders.models import Cart, CartItem
from apps.products.models import Product, ProductVariant


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
    def execute(
        *,
        user: User,
        product_id: int,
        quantity: int,
        variant_id: int | None = None,
    ) -> CartItem:
        if quantity <= 0:
            raise InvalidQuantityError()

        product = Product.objects.select_for_update().filter(pk=product_id).first()
        if product is None or product.status != ProductStatus.ACTIVE:
            raise ProductNotPurchasable()

        variants_exist = ProductVariant.objects.filter(product=product).exists()
        variant = None
        if variant_id is not None:
            variant = (
                ProductVariant.objects.select_for_update()
                .filter(pk=variant_id, product=product)
                .first()
            )
            if variant is None:
                raise ProductVariantMismatchError()
            if not variant.is_active:
                raise ProductVariantNotPurchasable()
        elif variants_exist:
            raise ProductVariantNotPurchasable()

        cart, _created = Cart.objects.get_or_create(user=user)

        item = (
            CartItem.objects.select_for_update()
            .filter(cart=cart, product_id=product_id, variant=variant)
            .first()
        )
        requested_quantity = quantity + (item.quantity if item else 0)
        available_stock = variant.stock if variant is not None else product.stock
        if available_stock is not None and available_stock < requested_quantity:
            raise InsufficientStockError()
        if item is None:
            return CartItem.objects.create(
                cart=cart,
                product_id=product_id,
                variant=variant,
                quantity=quantity,
            )

        item.quantity += quantity
        item.save(update_fields=["quantity", "updated_at"])
        return item
