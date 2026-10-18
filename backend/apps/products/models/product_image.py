from django.db import models
from django.db.models import Q

from apps.common.models import BaseModel


class ProductImage(BaseModel):
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="products/images/")
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Mahsulot rasmi"
        verbose_name_plural = "Mahsulot rasmlari"
        indexes = [
            models.Index(fields=["product"], name="product_image_product_idx"),
            models.Index(fields=["product", "sort_order"], name="product_image_sort_idx"),
            models.Index(fields=["is_primary"], name="product_image_primary_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["product", "sort_order"],
                name="unique_product_image_sort_order",
            ),
            models.UniqueConstraint(
                fields=["product"],
                condition=Q(is_primary=True),
                name="unique_primary_image_per_product",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.product} image {self.sort_order}"
