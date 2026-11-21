from django.conf import settings
from django.db import models
from django.db.models import Q

from apps.common.models import BaseModel


class StoreReview(BaseModel):
    """A customer's rating of a store, tied to one completed order (one per order)."""

    order = models.OneToOneField(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="review",
    )
    store = models.ForeignKey(
        "stores.Store",
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="store_reviews",
    )
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    seller_reply = models.TextField(blank=True)
    seller_replied_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Do'kon bahosi"
        verbose_name_plural = "Do'kon baholari"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["store", "-created_at"], name="review_store_idx")]
        constraints = [
            models.CheckConstraint(
                condition=Q(rating__gte=1) & Q(rating__lte=5),
                name="store_review_rating_1_5",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.store_id}: {self.rating}/5"
