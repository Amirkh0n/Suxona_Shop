from django.db import transaction

from apps.common.enums import OrderStatus
from apps.orders.exceptions import InvalidOrderStatusError, OrderNotFound
from apps.orders.models import Order


class AcceptOrderService:
    @staticmethod
    @transaction.atomic
    def execute(*, order: Order) -> Order:
        try:
            order = Order.objects.select_for_update().get(pk=order.pk)
        except Order.DoesNotExist as exc:
            raise OrderNotFound() from exc

        if order.status != OrderStatus.PENDING:
            raise InvalidOrderStatusError()

        order.status = OrderStatus.ACCEPTED
        order.save(update_fields=["status", "updated_at"])

        return order
