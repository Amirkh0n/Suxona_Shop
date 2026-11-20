from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    """Append-only record of who did what to which object (admin/seller decisions)."""

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    action = models.CharField(max_length=60)
    target_type = models.CharField(max_length=60)
    target_id = models.CharField(max_length=40)
    summary = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Audit yozuvi"
        verbose_name_plural = "Audit jurnali"
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["target_type", "target_id"], name="audit_target_idx"),
            models.Index(fields=["actor", "-created_at"], name="audit_actor_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.action} {self.target_type}#{self.target_id}"
