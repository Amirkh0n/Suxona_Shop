from django.conf import settings
from django.db import models

from apps.common.models import BaseModel


class Cart(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
    )

    class Meta:
        verbose_name = "Savat"
        verbose_name_plural = "Savatlar"
        indexes = [
            models.Index(fields=["user"], name="cart_user_idx"),
        ]

    def __str__(self) -> str:
        return f"Cart for {self.user}"
