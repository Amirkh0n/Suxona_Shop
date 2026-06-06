from django.db import models
from django.db.models import Q

from apps.common.models import BaseModel


class OrderItem(BaseModel):
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.PROTECT,
        related_name="order_items",
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField()
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        indexes = [
            models.Index(fields=["order"], name="order_item_order_idx"),
            models.Index(fields=["product"], name="order_item_product_idx"),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(price__gte=0),
                name="order_item_price_non_negative",
            ),
            models.CheckConstraint(
                condition=Q(quantity__gt=0),
                name="order_item_quantity_positive",
            ),
            models.CheckConstraint(
                condition=Q(subtotal__gte=0),
                name="order_item_subtotal_non_negative",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.product} x {self.quantity}"
