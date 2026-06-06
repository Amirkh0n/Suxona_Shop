from apps.orders.models import Cart


class CartSelector:
    @staticmethod
    def get_user_cart(user_id) -> Cart | None:
        return (
            Cart.objects.filter(user_id=user_id)
            .select_related("user")
            .first()
        )

    @staticmethod
    def get_cart_by_id(cart_id) -> Cart | None:
        return (
            Cart.objects.filter(pk=cart_id)
            .select_related("user")
            .first()
        )
