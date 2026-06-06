from django.db.models import QuerySet

from apps.orders.models import OrderItem


class OrderItemSelector:
    @staticmethod
    def get_order_items(order_id) -> QuerySet[OrderItem]:
        return (
            OrderItem.objects.filter(order_id=order_id)
            .select_related("product")
            .order_by("created_at")
        )
