from django.db.models import QuerySet

from apps.orders.models import CartItem


class CartItemSelector:
    @staticmethod
    def get_cart_item_by_id(cart_item_id) -> CartItem | None:
        return (
            CartItem.objects.filter(pk=cart_item_id)
            .select_related(
                "product",
                "product__store",
                "product__category",
                "variant",
                "variant__product",
                "cart",
            )
            .prefetch_related("product__images", "product__variants")
            .first()
        )

    @staticmethod
    def get_cart_items(cart_id) -> QuerySet[CartItem]:
        return (
            CartItem.objects.filter(cart_id=cart_id)
            .select_related(
                "product",
                "product__store",
                "product__category",
                "variant",
                "variant__product",
            )
            .prefetch_related("product__images", "product__variants")
            .order_by("product__store_id", "created_at")
        )

    @staticmethod
    def get_cart_store_items(cart_id, store_id) -> QuerySet[CartItem]:
        return (
            CartItem.objects.filter(
                cart_id=cart_id,
                product__store_id=store_id,
            )
            .select_related(
                "product",
                "product__store",
                "product__category",
                "variant",
                "variant__product",
            )
            .prefetch_related("product__images", "product__variants")
            .order_by("created_at")
        )

    @staticmethod
    def cart_has_store_items(cart_id, store_id) -> bool:
        return CartItem.objects.filter(
            cart_id=cart_id,
            product__store_id=store_id,
        ).exists()
