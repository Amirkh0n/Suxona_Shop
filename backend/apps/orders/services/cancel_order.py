from django.db import transaction

from apps.accounts.models import User
from apps.common.enums import OrderStatus
from apps.orders.exceptions import (
    InvalidOrderStatusError,
    NotOrderOwnerError,
    OrderNotFound,
)
from apps.orders.models import Order


class CancelOrderService:
    """Cancel an order (customer action).

    Business rules:
    - Only the order's customer may cancel it.
    - Only PENDING orders can be cancelled.
    - A cancelled order transitions to CANCELLED.
    """

    @staticmethod
    @transaction.atomic
    def execute(*, order: Order, actor: User) -> Order:
        try:
            locked = Order.objects.select_for_update().get(pk=order.pk)
        except Order.DoesNotExist as exc:
            raise OrderNotFound() from exc

        if locked.customer_id != actor.pk:
            raise NotOrderOwnerError()

        if locked.status != OrderStatus.PENDING:
            raise InvalidOrderStatusError()

        locked.status = OrderStatus.CANCELLED
        locked.save(update_fields=["status", "updated_at"])

        return locked
