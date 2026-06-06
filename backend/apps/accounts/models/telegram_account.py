from django.conf import settings
from django.db import models

from apps.common.models import BaseModel


class TelegramAccount(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="telegram_account",
    )
    telegram_id = models.CharField(max_length=64, unique=True)
    username = models.CharField(max_length=255, blank=True)
    linked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["telegram_id"], name="telegram_account_id_idx"),
            models.Index(fields=["user"], name="telegram_account_user_idx"),
        ]

    def __str__(self) -> str:
        return self.username or self.telegram_id
