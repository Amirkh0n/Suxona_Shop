from django.db import models
from django.db.models import Q

from apps.common.models import BaseModel


class Category(BaseModel):
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="children",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=255)
    icon = models.ImageField(upload_to="categories/icons/", blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=["parent"], name="category_parent_idx"),
            models.Index(fields=["name"], name="category_name_idx"),
            models.Index(fields=["is_active"], name="category_active_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["parent", "name"],
                condition=Q(parent__isnull=False),
                name="unique_category_parent_name",
            ),
            models.UniqueConstraint(
                fields=["name"],
                condition=Q(parent__isnull=True),
                name="unique_root_category_name",
            ),
        ]

    def __str__(self) -> str:
        return self.name
