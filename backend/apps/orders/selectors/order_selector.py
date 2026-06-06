from django.db.models import QuerySet

from apps.orders.models import Order


class OrderSelector:
    @staticmethod
    def get_order_by_id(order_id) -> Order | None:
        return (
            Order.objects.filter(pk=order_id)
            .select_related("customer", "store", "address", "address__village")
            .prefetch_related("items", "items__product", "items__product__images")
            .first()
        )

    @staticmethod
    def get_customer_order(customer_id, order_id) -> Order | None:
        return (
            Order.objects.filter(pk=order_id, customer_id=customer_id)
            .select_related("customer", "store", "address", "address__village")
            .prefetch_related("items", "items__product", "items__product__images")
            .first()
        )

    @staticmethod
    def get_store_order(store_id, order_id) -> Order | None:
        return (
            Order.objects.filter(pk=order_id, store_id=store_id)
            .select_related("customer", "store", "address", "address__village")
            .prefetch_related("items", "items__product", "items__product__images")
            .first()
        )

    @staticmethod
    def get_customer_orders(customer_id) -> QuerySet[Order]:
        return (
            Order.objects.filter(customer_id=customer_id)
            .select_related("customer", "store", "address")
            .order_by("-created_at")
        )

    @staticmethod
    def get_store_orders(store_id) -> QuerySet[Order]:
        return (
            Order.objects.filter(store_id=store_id)
            .select_related("customer", "store", "address")
            .order_by("-created_at")
        )

    @staticmethod
    def get_orders_by_status(status) -> QuerySet[Order]:
        return (
            Order.objects.filter(status=status)
            .select_related("customer", "store", "address")
            .order_by("-created_at")
        )
