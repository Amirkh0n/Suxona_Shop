from django.conf import settings
from django.db import models

from apps.common.enums import StoreApplicationStatus
from apps.common.models import BaseModel


class StoreApplication(BaseModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="store_applications",
    )
    store_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    status = models.CharField(
        max_length=20,
        choices=StoreApplicationStatus.choices,
        default=StoreApplicationStatus.PENDING,
    )
    admin_note = models.TextField(blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["owner"], name="store_app_owner_idx"),
            models.Index(fields=["status"], name="store_app_status_idx"),
            models.Index(fields=["created_at"], name="store_app_created_idx"),
        ]

    def __str__(self) -> str:
        return self.store_name
