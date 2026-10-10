from decimal import Decimal

from django.db import models
from django.db.models import Q

from apps.common.models import BaseModel


class ProductVariant(BaseModel):
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        related_name="variants",
    )
    sku = models.CharField(max_length=100)
    attributes = models.JSONField(default=dict)
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    stock = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=["product"], name="variant_product_idx"),
            models.Index(fields=["sku"], name="variant_sku_idx"),
            models.Index(fields=["product", "is_active"], name="variant_active_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["product", "sku"],
                name="unique_product_variant_sku",
            ),
            models.UniqueConstraint(
                fields=["product", "attributes"],
                name="unique_product_variant_attributes",
            ),
            models.CheckConstraint(
                condition=Q(price__gte=Decimal("0")) | Q(price__isnull=True),
                name="variant_price_non_negative",
            ),
            models.CheckConstraint(
                condition=Q(stock__gte=0) | Q(stock__isnull=True),
                name="variant_stock_non_negative",
            ),
        ]

    def effective_price(self):
        return self.price if self.price is not None else self.product.price

    def __str__(self) -> str:
        return f"{self.product} ({self.sku})"
