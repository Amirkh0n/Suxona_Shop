from django.conf import settings
from django.db import models
from django.db.models import Q

from apps.common.models import BaseModel


class Address(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="addresses",
    )
    village = models.ForeignKey(
        "stores.Village",
        on_delete=models.PROTECT,
        related_name="addresses",
    )
    street = models.CharField(max_length=255)
    house = models.CharField(max_length=100)
    landmark = models.CharField(max_length=255, blank=True)
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Manzil"
        verbose_name_plural = "Manzillar"
        indexes = [
            models.Index(fields=["user"], name="address_user_idx"),
            models.Index(fields=["village"], name="address_village_idx"),
            models.Index(fields=["user", "is_default"], name="address_user_default_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=Q(is_default=True),
                name="unique_default_address_per_user",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.user} - {self.village}"
