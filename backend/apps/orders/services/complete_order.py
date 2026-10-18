from django.db import transaction

from apps.common.enums import OrderStatus
from apps.notifications.telegram.services import (
    after_commit,
    notify_customer_order_status,
)
from apps.orders.exceptions import InvalidOrderStatusError, OrderNotFound
from apps.orders.models import Order


class CompleteOrderService:
    @staticmethod
    @transaction.atomic
    def execute(*, order: Order) -> Order:
        try:
            order = Order.objects.select_for_update().get(pk=order.pk)
        except Order.DoesNotExist as exc:
            raise OrderNotFound() from exc

        if order.status != OrderStatus.DELIVERING:
            raise InvalidOrderStatusError()

        order.status = OrderStatus.COMPLETED
        order.save(update_fields=["status", "updated_at"])
        after_commit(notify_customer_order_status, order_id=order.pk)

        return order
