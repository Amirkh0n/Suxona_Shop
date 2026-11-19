from apps.common.enums import OrderStatus
from apps.notifications.telegram.services import (
    after_commit,
    notify_customer_order_status,
)
from apps.orders.models import Order
from apps.orders.state_machine import apply_transition


class MarkDeliveringService:
    @staticmethod
    def execute(*, order: Order, courier_name: str = "", courier_phone: str = "") -> Order:
        order = apply_transition(
            order=order,
            target=OrderStatus.DELIVERING,
            expected=frozenset({OrderStatus.ACCEPTED}),
        )
        if courier_name or courier_phone:
            order.courier_name = courier_name
            order.courier_phone = courier_phone
            order.save(update_fields=["courier_name", "courier_phone", "updated_at"])
        after_commit(notify_customer_order_status, order_id=order.pk)
        return order
