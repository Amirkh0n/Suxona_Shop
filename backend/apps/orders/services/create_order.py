from decimal import Decimal

from django.db import transaction

from apps.accounts.models import Address, User
from apps.common.enums import OrderStatus, ProductStatus, StoreStatus
from apps.orders.exceptions import (
    AddressOwnershipError,
    CartNotFoundError,
    DeliveryZoneNotFoundError,
    EmptyStoreCartError,
    InsufficientStockError,
    ProductNotActiveError,
    ProductVariantMismatchError,
    ProductVariantNotPurchasable,
    StoreNotActiveError,
)
from apps.orders.models import Cart, CartItem, Order, OrderItem
from apps.products.models import Product, ProductVariant
from apps.stores.models import DeliveryZone, Store


class CreateOrderService:
    @staticmethod
    @transaction.atomic
    def execute(
        *,
        customer: User,
        store: Store,
        address: Address,
        note: str = "",
    ) -> Order:
        if address.user_id != customer.pk:
            raise AddressOwnershipError()

        if store.status != StoreStatus.ACTIVE:
            raise StoreNotActiveError()

        try:
            cart = Cart.objects.select_for_update().get(user=customer)
        except Cart.DoesNotExist as exc:
            raise CartNotFoundError() from exc

        cart_items = list(
            CartItem.objects.select_for_update()
            .select_related("product", "variant")
            .filter(cart=cart, product__store=store)
        )
        if not cart_items:
            raise EmptyStoreCartError()

        product_ids = {item.product_id for item in cart_items}
        locked_products = {
            product.pk: product
            for product in Product.objects.select_for_update().filter(
                pk__in=product_ids,
            )
        }
        variant_ids = {item.variant_id for item in cart_items if item.variant_id}
        locked_variants = {
            variant.pk: variant
            for variant in ProductVariant.objects.select_for_update().filter(
                pk__in=variant_ids,
            )
        }

        for item in cart_items:
            product = locked_products.get(item.product_id)
            if product is None:
                raise ProductNotActiveError()
            if product.status != ProductStatus.ACTIVE:
                raise ProductNotActiveError()

            variant = None
            if item.variant_id is not None:
                variant = locked_variants.get(item.variant_id)
                if variant is None or variant.product_id != product.pk:
                    raise ProductVariantMismatchError()
                if not variant.is_active:
                    raise ProductVariantNotPurchasable()

            available_stock = variant.stock if variant is not None else product.stock
            if available_stock is not None and available_stock < item.quantity:
                raise InsufficientStockError()

        try:
            delivery_zone = DeliveryZone.objects.get(
                store=store,
                village=address.village,
                is_active=True,
            )
        except DeliveryZone.DoesNotExist as exc:
            raise DeliveryZoneNotFoundError() from exc

        line_items = []
        subtotal = Decimal("0")
        for item in cart_items:
            product = locked_products[item.product_id]
            variant = locked_variants.get(item.variant_id) if item.variant_id else None
            price = variant.price if variant and variant.price is not None else product.price
            line_subtotal = price * item.quantity
            subtotal += line_subtotal
            line_items.append((item, product, variant, price, line_subtotal))

        delivery_price = delivery_zone.delivery_price
        total = subtotal + delivery_price

        order = Order.objects.create(
            customer=customer,
            store=store,
            address=address,
            delivery_price=delivery_price,
            subtotal=subtotal,
            total=total,
            status=OrderStatus.PENDING,
            note=note,
        )

        OrderItem.objects.bulk_create(
            [
                OrderItem(
                    order=order,
                    product=product,
                    variant=variant,
                    price=price,
                    quantity=item.quantity,
                    subtotal=line_subtotal,
                )
                for item, product, variant, price, line_subtotal in line_items
            ],
        )

        for item, product, variant, _price, _line_subtotal in line_items:
            if variant is not None and variant.stock is not None:
                variant.stock -= item.quantity
                variant.save(update_fields=["stock", "updated_at"])
            elif product.stock is not None:
                product.stock -= item.quantity
                product.save(update_fields=["stock", "updated_at"])

        CartItem.objects.filter(pk__in=[item.pk for item in cart_items]).delete()

        return order
