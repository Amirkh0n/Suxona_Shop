from django.db import transaction

from apps.accounts.models import User
from apps.orders.models import Cart, CartItem


class ClearCartService:
    """Remove all items from the user's cart.

    Business rules:
    - One cart per user; the cart is created automatically if missing.
    - Only the user's own cart is affected.
    """

    @staticmethod
    @transaction.atomic
    def execute(*, user: User) -> None:
        cart, _created = Cart.objects.get_or_create(user=user)
        CartItem.objects.filter(cart=cart).delete()
