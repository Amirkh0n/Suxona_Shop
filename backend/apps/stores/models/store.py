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

    class Meta:
        verbose_name = "Do'kon"
        verbose_name_plural = "Do'konlar"
        indexes = [
            models.Index(fields=["owner"], name="store_owner_idx"),
            models.Index(fields=["name"], name="store_name_idx"),
            models.Index(fields=["status"], name="store_status_idx"),
            models.Index(fields=["created_at"], name="store_created_idx"),
        ]

    def __str__(self) -> str:
        return self.name
