from django.db import models
from django.db.models import Q

from apps.common.models import BaseModel


class CartItem(BaseModel):
    cart = models.ForeignKey(
        "orders.Cart",
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        related_name="cart_items",
    )
    quantity = models.PositiveIntegerField()

    class Meta:
        indexes = [
            models.Index(fields=["cart"], name="cart_item_cart_idx"),
            models.Index(fields=["product"], name="cart_item_product_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["cart", "product"],
                name="unique_cart_product",
            ),
            models.CheckConstraint(
                condition=Q(quantity__gt=0),
                name="cart_item_quantity_positive",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.product} x {self.quantity}"
