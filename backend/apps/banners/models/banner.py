from django.db import models

from apps.common.models import BaseModel


class Banner(BaseModel):
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to="banners/")
    url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Banner"
        verbose_name_plural = "Bannerlar"
        indexes = [
            models.Index(fields=["is_active"], name="banner_active_idx"),
            models.Index(fields=["sort_order"], name="banner_sort_order_idx"),
        ]
        ordering = ["sort_order", "-created_at"]

    def __str__(self) -> str:
        return self.title
