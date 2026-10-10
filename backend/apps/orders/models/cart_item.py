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
    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.CASCADE,
        related_name="cart_items",
        null=True,
        blank=True,
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
                condition=Q(variant__isnull=True),
                name="unique_cart_product",
            ),
            models.UniqueConstraint(
                fields=["cart", "product", "variant"],
                condition=Q(variant__isnull=False),
                name="unique_cart_product_variant",
            ),
            models.CheckConstraint(
                condition=Q(quantity__gt=0),
                name="cart_item_quantity_positive",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.product} x {self.quantity}"
