from django.db import models
from django.db.models import Q

from apps.common.models import BaseModel


class DeliveryZone(BaseModel):
    store = models.ForeignKey(
        "stores.Store",
        on_delete=models.CASCADE,
        related_name="delivery_zones",
    )
    village = models.ForeignKey(
        "stores.Village",
        on_delete=models.PROTECT,
        related_name="delivery_zones",
    )
    delivery_price = models.DecimalField(max_digits=12, decimal_places=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Yetkazib berish hududi"
        verbose_name_plural = "Yetkazib berish hududlari"
        indexes = [
            models.Index(fields=["store"], name="delivery_zone_store_idx"),
            models.Index(fields=["village"], name="delivery_zone_village_idx"),
            models.Index(fields=["is_active"], name="delivery_zone_active_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["store", "village"],
                name="unique_store_village_delivery_zone",
            ),
            models.CheckConstraint(
                condition=Q(delivery_price__gte=0),
                name="delivery_zone_price_non_negative",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.store} - {self.village}"
