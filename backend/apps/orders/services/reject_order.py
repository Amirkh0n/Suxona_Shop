from django.db import transaction

from apps.common.enums import OrderStatus
from apps.orders.exceptions import InvalidOrderStatusError, OrderNotFound
from apps.orders.models import Order
from apps.orders.services.restock import restock_order_items


class RejectOrderService:
    @staticmethod
    @transaction.atomic
    def execute(*, order: Order, reason: str = "") -> Order:
        try:
            order = Order.objects.select_for_update().get(pk=order.pk)
        except Order.DoesNotExist as exc:
            raise OrderNotFound() from exc

        if order.status != OrderStatus.PENDING:
            raise InvalidOrderStatusError()

        order.status = OrderStatus.REJECTED
        if reason:
            order.note = reason
        order.save(update_fields=["status", "note", "updated_at"])
        restock_order_items(order)

        return order
