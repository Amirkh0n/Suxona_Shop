from django.db import models

from apps.common.models import BaseModel


class ReturnRequest(BaseModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    order = models.OneToOneField(
        "orders.Order", on_delete=models.CASCADE, related_name="return_request"
    )
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    seller_note = models.TextField(blank=True)

    class Meta:
        verbose_name = "Qaytarish so'rovi"
        verbose_name_plural = "Qaytarish so'rovlari"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Return #{self.order_id} ({self.status})"
