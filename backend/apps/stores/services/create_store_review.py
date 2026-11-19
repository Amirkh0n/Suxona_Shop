from django.db import transaction
from django.db.models import Avg, Count

from apps.accounts.models import User
from apps.common.enums import OrderStatus
from apps.stores.exceptions import (
    ReviewAlreadyExistsError,
    ReviewNotAllowedError,
    ReviewOrderNotFound,
)
from apps.stores.models import Store, StoreReview


class CreateStoreReviewService:
    """Rate a store once per completed order and refresh the store's average."""

    @staticmethod
    @transaction.atomic
    def execute(*, order_id: int, customer: User, rating: int, comment: str = "") -> StoreReview:
        from apps.orders.models import Order

        order = Order.objects.select_for_update(of=("self",)).filter(pk=order_id).first()
        # A stranger's order id looks the same as a missing one (no enumeration).
        if order is None or order.customer_id != customer.pk:
            raise ReviewOrderNotFound()
        if order.status != OrderStatus.COMPLETED:
            raise ReviewNotAllowedError()
        if StoreReview.objects.filter(order=order).exists():
            raise ReviewAlreadyExistsError()

        review = StoreReview.objects.create(
            order=order, store_id=order.store_id, customer=customer,
            rating=rating, comment=comment,
        )

        store = Store.objects.select_for_update().get(pk=order.store_id)
        agg = StoreReview.objects.filter(store=store).aggregate(avg=Avg("rating"), n=Count("id"))
        store.rating_avg = round(agg["avg"] or 0, 2)
        store.rating_count = agg["n"]
        store.save(update_fields=["rating_avg", "rating_count", "updated_at"])
        return review
