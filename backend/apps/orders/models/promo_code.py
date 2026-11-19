from decimal import Decimal

from django.db import models
from django.db.models import Q
from django.utils import timezone

from apps.common.models import BaseModel


class PromoCode(BaseModel):
    class Kind(models.TextChoices):
        PERCENT = "PERCENT", "Percent"
        FIXED = "FIXED", "Fixed amount"

    code = models.CharField(max_length=40, unique=True)
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.PERCENT)
    value = models.DecimalField(max_digits=12, decimal_places=2)
    # Optional cap for percent codes.
    max_discount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    min_order_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    # Null store = valid in every store.
    store = models.ForeignKey(
        "stores.Store", on_delete=models.CASCADE, null=True, blank=True, related_name="promo_codes"
    )
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Promokod"
        verbose_name_plural = "Promokodlar"
        constraints = [
            models.CheckConstraint(condition=Q(value__gt=0), name="promo_value_positive"),
        ]

    def __str__(self) -> str:
        return self.code

    def save(self, *args, **kwargs):
        self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    def discount_for(self, subtotal: Decimal) -> Decimal:
        if self.kind == self.Kind.PERCENT:
            amount = subtotal * self.value / Decimal("100")
            if self.max_discount is not None:
                amount = min(amount, self.max_discount)
        else:
            amount = self.value
        # Never more than the goods cost.
        return min(amount.quantize(Decimal("0.01")), subtotal)

    def is_live(self) -> bool:
        now = timezone.now()
        return (
            self.is_active
            and (self.valid_from is None or self.valid_from <= now)
            and (self.valid_until is None or self.valid_until >= now)
            and (self.max_uses is None or self.used_count < self.max_uses)
        )
