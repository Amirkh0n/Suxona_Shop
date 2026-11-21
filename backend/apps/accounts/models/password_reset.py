from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.common.models import BaseModel

RESET_CODE_TTL = timedelta(minutes=10)
MAX_ATTEMPTS = 5


class PasswordResetCode(BaseModel):
    """Six-digit code delivered through the user's linked Telegram; stored hashed."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="password_reset_codes"
    )
    code_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["user", "-created_at"], name="pwreset_user_idx")]

    def is_usable(self) -> bool:
        return (
            self.used_at is None
            and self.attempts < MAX_ATTEMPTS
            and self.expires_at > timezone.now()
        )
