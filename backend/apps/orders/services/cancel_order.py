from apps.accounts.models import User
from apps.common.enums import OrderStatus
from apps.notifications.telegram.services import (
    after_commit,
    notify_customer_order_status,
    notify_seller_order_cancelled,
)
from apps.orders.models import Order
from apps.orders.state_machine import (
    CANCEL_RULES,
    CUSTOMER,
    actor_roles,
    apply_transition,
    require_cancel_permission,
)


class CancelOrderService:
    """Cancel an order on behalf of the customer, the seller or staff.

    Which statuses each role may cancel from is defined in
    ``state_machine.CANCEL_RULES``. The *other* party is notified: the seller
    when the customer cancels, the customer when the store or an admin does.
    """

    @staticmethod
    def execute(*, order: Order, actor: User) -> Order:
        # Re-read with the store so ownership checks see current data.
        order = Order.objects.select_related("store").get(pk=order.pk)
        require_cancel_permission(order, actor)
        roles = actor_roles(order, actor)
        cancelled_by_customer = CUSTOMER in roles

        # Pin the allowed source statuses to this actor's roles so a concurrent
        # change (e.g. the seller accepting while the customer cancels) is
        # re-checked under the row lock instead of slipping through.
        allowed_from = frozenset().union(*(CANCEL_RULES[r] for r in roles))
        order = apply_transition(
            order=order,
            target=OrderStatus.CANCELLED,
            expected=allowed_from,
        )
        if cancelled_by_customer:
            after_commit(notify_seller_order_cancelled, order_id=order.pk)
        else:
            after_commit(notify_customer_order_status, order_id=order.pk)
        return order
