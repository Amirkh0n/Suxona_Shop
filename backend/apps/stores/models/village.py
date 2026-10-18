from django.db import models

from apps.common.models import BaseModel


class Village(BaseModel):
    name = models.CharField(max_length=255)
    district = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Qishloq"
        verbose_name_plural = "Qishloqlar"
        indexes = [
            models.Index(fields=["name"], name="village_name_idx"),
            models.Index(fields=["district"], name="village_district_idx"),
            models.Index(fields=["is_active"], name="village_active_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["name", "district"],
                name="unique_village_name_district",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name}, {self.district}"
