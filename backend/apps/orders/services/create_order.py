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
    StoreNotActiveError,
)
from apps.orders.models import Cart, CartItem, Order, OrderItem
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
            .select_related("product")
            .filter(cart=cart, product__store=store)
        )
        if not cart_items:
            raise EmptyStoreCartError()

        for item in cart_items:
            product = item.product
            if product.status != ProductStatus.ACTIVE:
                raise ProductNotActiveError()
            if product.stock is not None and product.stock < item.quantity:
                raise InsufficientStockError()

        try:
            delivery_zone = DeliveryZone.objects.get(
                store=store,
                village=address.village,
                is_active=True,
            )
        except DeliveryZone.DoesNotExist as exc:
            raise DeliveryZoneNotFoundError() from exc

        subtotal = sum(
            (item.product.price * item.quantity for item in cart_items),
            Decimal("0"),
        )
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
                    product=item.product,
                    price=item.product.price,
                    quantity=item.quantity,
                    subtotal=item.product.price * item.quantity,
                )
                for item in cart_items
            ],
        )

        CartItem.objects.filter(pk__in=[item.pk for item in cart_items]).delete()

        return order
