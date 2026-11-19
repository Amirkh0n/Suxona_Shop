from django.conf import settings
from django.db import models

from apps.common.models import BaseModel


class Notification(BaseModel):
    """In-app notification (the bell icon). Telegram is a separate channel."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    kind = models.CharField(max_length=30, default="info")
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    # Frontend path, e.g. "/buyurtma/12".
    link = models.CharField(max_length=300, blank=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Bildirishnoma"
        verbose_name_plural = "Bildirishnomalar"
        ordering = ["-created_at", "-id"]
        indexes = [models.Index(fields=["user", "is_read", "-created_at"], name="notif_user_idx")]

    def __str__(self) -> str:
        return f"{self.user_id}: {self.title}"
