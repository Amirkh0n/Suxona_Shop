from django.conf import settings
from django.db import models
from django.db.models import Q

from apps.common.enums import ProductStatus
from apps.common.models import BaseModel


class Product(BaseModel):
    store = models.ForeignKey(
        "stores.Store",
        on_delete=models.CASCADE,
        related_name="products",
    )
    category = models.ForeignKey(
        "products.Category",
        on_delete=models.PROTECT,
        related_name="products",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    stock = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=ProductStatus.choices,
        default=ProductStatus.DRAFT,
    )
    # --- moderation -------------------------------------------------------
    # approved_at is set the first time an admin approves the product and is
    # never cleared: it is what lets the seller hide/show an already-approved
    # product freely, while a never-approved one must go through review.
    approved_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_products",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    moderation_note = models.TextField(blank=True)

    class Meta:
        verbose_name = "Mahsulot"
        verbose_name_plural = "Mahsulotlar"
        indexes = [
            models.Index(fields=["store"], name="product_store_idx"),
            models.Index(fields=["category"], name="product_category_idx"),
            models.Index(fields=["status"], name="product_status_idx"),
            models.Index(fields=["name"], name="product_name_idx"),
            models.Index(fields=["price"], name="product_price_idx"),
            models.Index(fields=["created_at"], name="product_created_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["store", "name"],
                name="unique_store_product_name",
            ),
            models.CheckConstraint(
                condition=Q(price__gte=0),
                name="product_price_non_negative",
            ),
            models.CheckConstraint(
                condition=Q(stock__gte=0) | Q(stock__isnull=True),
                name="product_stock_non_negative",
            ),
        ]

    def __str__(self) -> str:
        return self.name
