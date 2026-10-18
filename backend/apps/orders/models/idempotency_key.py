from django.conf import settings
from django.db import models

from apps.common.models import BaseModel


class IdempotencyKey(BaseModel):
    """Remembers which order a client-supplied ``Idempotency-Key`` produced.

    Created in the same transaction as the order, so a failed checkout leaves no
    key behind (the client may retry with the same key) and a successful one is
    replayed instead of creating a duplicate order.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="idempotency_keys",
    )
    key = models.CharField(max_length=128)
    request_hash = models.CharField(max_length=64)
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="idempotency_keys",
    )

    class Meta:
        verbose_name = "Idempotentlik kaliti"
        verbose_name_plural = "Idempotentlik kalitlari"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "key"], name="unique_user_idempotency_key"
            ),
        ]
        indexes = [models.Index(fields=["created_at"], name="idem_created_idx")]

    def __str__(self) -> str:
        return f"{self.user_id}:{self.key}"
