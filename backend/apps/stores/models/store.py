from django.conf import settings
from django.db import models

from apps.common.enums import StoreStatus
from apps.common.models import BaseModel


class Store(BaseModel):
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="store",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to="stores/logos/", blank=True)
    banner = models.ImageField(upload_to="stores/banners/", blank=True)
    phone = models.CharField(max_length=20)
    telegram_username = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=20,
        choices=StoreStatus.choices,
        default=StoreStatus.PENDING,
    )
    # --- storefront info shown to shoppers ----------------------------------
    min_order_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0, help_text="Minimum order subtotal, so'm."
    )
    opens_at = models.TimeField(null=True, blank=True)
    closes_at = models.TimeField(null=True, blank=True)
    delivery_time = models.CharField(
        max_length=60, blank=True, help_text='Free text, e.g. "1-2 kun".'
    )
    # Optional map position; enables "nearby stores" sorting.
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    allows_pickup = models.BooleanField(
        default=False, help_text="Customers may collect orders at the store."
    )
    # Denormalised from StoreReview by CreateStoreReviewService; read-only.
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Do'kon"
        verbose_name_plural = "Do'konlar"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(min_order_amount__gte=0),
                name="store_min_order_non_negative",
            ),
        ]
        indexes = [
            models.Index(fields=["owner"], name="store_owner_idx"),
            models.Index(fields=["name"], name="store_name_idx"),
            models.Index(fields=["status"], name="store_status_idx"),
            models.Index(fields=["created_at"], name="store_created_idx"),
        ]

    @property
    def is_open(self) -> bool | None:
        """True/False by local time; None when working hours are not set."""
        if self.opens_at is None or self.closes_at is None:
            return None
        from django.utils import timezone

        now = timezone.localtime().time()
        if self.opens_at <= self.closes_at:
            return self.opens_at <= now <= self.closes_at
        return now >= self.opens_at or now <= self.closes_at  # overnight shift

    def __str__(self) -> str:
        return self.name
