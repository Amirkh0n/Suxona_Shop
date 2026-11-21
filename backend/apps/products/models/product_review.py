from django.conf import settings
from django.db import models
from django.db.models import Q

from apps.common.models import BaseModel


class ProductReview(BaseModel):
    """A verified buyer's rating of a product (one per customer and product)."""

    product = models.ForeignKey(
        "products.Product", on_delete=models.CASCADE, related_name="reviews"
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="product_reviews"
    )
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    # Moderators can hide abusive reviews; hidden ones do not count in the average.
    is_hidden = models.BooleanField(default=False)
    seller_reply = models.TextField(blank=True)
    seller_replied_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Mahsulot sharhi"
        verbose_name_plural = "Mahsulot sharhlari"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["product", "-created_at"], name="preview_product_idx")]
        constraints = [
            models.UniqueConstraint(fields=["product", "customer"], name="preview_one_per_user"),
            models.CheckConstraint(
                condition=Q(rating__gte=1) & Q(rating__lte=5), name="product_review_rating_1_5"
            ),
        ]
