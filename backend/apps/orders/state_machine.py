"""Single source of truth for order status transitions.

Every status change goes through ``apply_transition`` so the rules live in one
place instead of being re-implemented (and drifting) in each service:

    PENDING     -> ACCEPTED | REJECTED | CANCELLED
    ACCEPTED    -> DELIVERING | CANCELLED
    DELIVERING  -> COMPLETED | CANCELLED
    COMPLETED / CANCELLED / REJECTED are terminal.

*Who* may cancel is a separate question (``CANCEL_RULES``): a customer only
while the store has not reacted yet, the seller until delivery starts, staff
at any non-terminal stage (e.g. a failed delivery).
"""

from __future__ import annotations

from django.db import transaction

from apps.accounts.models import User
from apps.common.enums import OrderStatus
from apps.orders.exceptions import (
    InvalidOrderStatusError,
    NotOrderOwnerError,
    OrderNotFound,
)
from apps.orders.models import Order

S = OrderStatus

ALLOWED_TRANSITIONS: dict[str, frozenset[str]] = {
    S.PENDING: frozenset({S.ACCEPTED, S.REJECTED, S.CANCELLED}),
    S.ACCEPTED: frozenset({S.DELIVERING, S.CANCELLED}),
    S.DELIVERING: frozenset({S.COMPLETED, S.CANCELLED}),
    S.COMPLETED: frozenset(),
    S.CANCELLED: frozenset(),
    S.REJECTED: frozenset(),
}

TERMINAL_STATUSES = frozenset(s for s, nxt in ALLOWED_TRANSITIONS.items() if not nxt)

# Stock is returned to the shelf when an order dies before completion.
RESTOCK_ON = frozenset({S.CANCELLED, S.REJECTED})

CUSTOMER, SELLER, ADMIN = "customer", "seller", "admin"

# Statuses an order may be cancelled *from*, per role.
CANCEL_RULES: dict[str, frozenset[str]] = {
    CUSTOMER: frozenset({S.PENDING}),
    SELLER: frozenset({S.ACCEPTED}),
    ADMIN: frozenset({S.PENDING, S.ACCEPTED, S.DELIVERING}),
}


def can_transition(current: str, target: str) -> bool:
    return target in ALLOWED_TRANSITIONS.get(current, frozenset())


def actor_roles(order: Order, actor: User) -> set[str]:
    roles: set[str] = set()
    if order.customer_id == actor.pk:
        roles.add(CUSTOMER)
    if order.store.owner_id == actor.pk:
        roles.add(SELLER)
    if actor.is_staff:
        roles.add(ADMIN)
    return roles


def cancellable_by(order: Order, actor: User) -> bool:
    return any(order.status in CANCEL_RULES[r] for r in actor_roles(order, actor))


@transaction.atomic
def apply_transition(
    *,
    order: Order,
    target: str,
    expected: frozenset[str] | None = None,
    note: str | None = None,
) -> Order:
    """Lock the order, validate the move, persist it and restock if needed.

    ``expected`` lets a caller pin the *source* status (e.g. "accept" only makes
    sense from PENDING) on top of the global transition table.
    Notifications are left to the caller so it can pick the right recipient.
    """
    from apps.orders.services.restock import restock_order_items

    try:
        locked = Order.objects.select_for_update(of=("self",)).select_related(
            "store"
        ).get(pk=order.pk)
    except Order.DoesNotExist as exc:
        raise OrderNotFound() from exc

    if expected is not None and locked.status not in expected:
        raise InvalidOrderStatusError()
    if not can_transition(locked.status, target):
        raise InvalidOrderStatusError()

    fields = ["status", "updated_at"]
    locked.status = target
    if note:
        locked.note = note
        fields.append("note")
    locked.save(update_fields=fields)

    if target in RESTOCK_ON:
        restock_order_items(locked)
    return locked


def require_cancel_permission(order: Order, actor: User) -> None:
    roles = actor_roles(order, actor)
    if not roles:
        raise NotOrderOwnerError()
    if not any(order.status in CANCEL_RULES[r] for r in roles):
        raise InvalidOrderStatusError()
