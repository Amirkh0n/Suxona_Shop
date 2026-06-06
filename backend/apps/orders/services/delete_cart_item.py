from django.db import transaction

from apps.accounts.models import User
from apps.orders.exceptions import CartItemNotFound, NotCartOwnerError
from apps.orders.models import CartItem


class DeleteCartItemService:
    """Remove a single item from the user's cart.

    Business rules:
    - A user may remove only items in their own cart.
    """

    @staticmethod
    @transaction.atomic
    def execute(*, user: User, cart_item: CartItem) -> None:
        item = (
            CartItem.objects.select_for_update()
            .select_related("cart")
            .filter(pk=cart_item.pk)
            .first()
        )
        if item is None:
            raise CartItemNotFound()

        if item.cart.user_id != user.pk:
            raise NotCartOwnerError()

        item.delete()
