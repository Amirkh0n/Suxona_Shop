import secrets
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.common.models import BaseModel

VERIFICATION_TOKEN_TTL = timedelta(minutes=30)


def generate_verification_token() -> str:
    """Return a cryptographically secure, URL-safe verification token."""
    return secrets.token_urlsafe(32)


def default_token_expiry():
    return timezone.now() + VERIFICATION_TOKEN_TTL


class VerificationToken(BaseModel):
    """Single-use, time-boxed token that links a pending user to a Telegram
    account during registration verification."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="verification_token",
    )
    token = models.CharField(
        max_length=64,
        unique=True,
        default=generate_verification_token,
    )
    expires_at = models.DateTimeField(default=default_token_expiry)
    consumed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Tasdiqlash tokeni"
        verbose_name_plural = "Tasdiqlash tokenlari"
        indexes = [
            models.Index(fields=["token"], name="verification_token_idx"),
            models.Index(fields=["user"], name="verification_user_idx"),
        ]

    def is_consumed(self) -> bool:
        return self.consumed_at is not None

    def is_expired(self) -> bool:
        return self.expires_at <= timezone.now()

    def is_valid(self) -> bool:
        return not self.is_consumed() and not self.is_expired()

    def __str__(self) -> str:
        return f"VerificationToken(user={self.user_id}, consumed={self.is_consumed()})"
