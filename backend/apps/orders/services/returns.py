from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from apps.common.enums import OrderStatus
from apps.notifications.inapp import create_notification
from apps.orders.exceptions import (
    InvalidOrderStatusError,
    OrderNotFound,
    ReturnAlreadyRequestedError,
    ReturnNotAllowedError,
)
from apps.orders.models import Order, ReturnRequest

RETURN_WINDOW = timedelta(days=7)


class RequestReturnService:
    @staticmethod
    @transaction.atomic
    def execute(*, order_id: int, customer, reason: str) -> ReturnRequest:
        order = (
            Order.objects.select_for_update(of=("self",))
            .select_related("store__owner")
            .filter(pk=order_id)
            .first()
        )
        if order is None or order.customer_id != customer.pk:
            raise OrderNotFound()  # a stranger's order looks like a missing one
        too_late = timezone.now() - order.updated_at > RETURN_WINDOW
        if order.status != OrderStatus.COMPLETED or too_late:
            raise ReturnNotAllowedError()
        if ReturnRequest.objects.filter(order=order).exists():
            raise ReturnAlreadyRequestedError()
        request = ReturnRequest.objects.create(order=order, reason=reason)
        create_notification(
            order.store.owner, kind="return", title=f"Buyurtma #{order.pk} uchun qaytarish so'rovi",
            body=reason[:200], link=f"/buyurtma/{order.pk}",
        )
        return request


class DecideReturnService:
    @staticmethod
    @transaction.atomic
    def execute(*, order: Order, approve: bool, note: str = "") -> ReturnRequest:
        request = ReturnRequest.objects.select_for_update().filter(order=order).first()
        if request is None:
            raise OrderNotFound("No return request for this order.")
        if request.status != ReturnRequest.Status.PENDING:
            raise InvalidOrderStatusError("This return request was already decided.")
        request.status = (
            ReturnRequest.Status.APPROVED if approve else ReturnRequest.Status.REJECTED
        )
        request.seller_note = note
        request.save(update_fields=["status", "seller_note", "updated_at"])
        create_notification(
            order.customer, kind="return",
            title=f"Buyurtma #{order.pk}: qaytarish {'tasdiqlandi' if approve else 'rad etildi'}",
            body=note, link=f"/buyurtma/{order.pk}",
        )
        return request
