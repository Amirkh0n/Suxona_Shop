from apps.common.enums import OrderStatus
from apps.notifications.telegram.services import (
    after_commit,
    notify_customer_order_status,
)
from apps.orders.models import Order
from apps.orders.state_machine import apply_transition


class AcceptOrderService:
    @staticmethod
    def execute(*, order: Order) -> Order:
        order = apply_transition(
            order=order,
            target=OrderStatus.ACCEPTED,
            expected=frozenset({OrderStatus.PENDING}),
        )
        after_commit(notify_customer_order_status, order_id=order.pk)
        return order
