from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.accounts.exceptions import (
    InvalidVerificationTokenError,
    TelegramAlreadyLinkedError,
    VerificationExpiredError,
)
from apps.accounts.models import TelegramAccount, User, VerificationToken


class VerifyTelegramRegistrationService:
    """Complete registration verification via the Telegram bot.

    Triggered when the bot receives ``/start verify_<token>``. Validates the
    token, links the Telegram account to the user, activates the user, and
    consumes the token. The token is the only trusted secret; telegram_id and
    username are treated as untrusted until the token validates.
    """

    @staticmethod
    @transaction.atomic
    def execute(
        *,
        token: str,
        telegram_id: str,
        telegram_username: str = "",
    ) -> User:
        verification = (
            VerificationToken.objects.select_for_update()
            .select_related("user")
            .filter(token=token)
            .first()
        )
        if verification is None:
            raise InvalidVerificationTokenError()

        if verification.is_consumed() or verification.is_expired():
            raise VerificationExpiredError()

        # One telegram_id maps to exactly one user.
        existing = (
            TelegramAccount.objects.filter(telegram_id=telegram_id)
            .exclude(user_id=verification.user_id)
            .exists()
        )
        if existing:
            raise TelegramAlreadyLinkedError()

        user = verification.user

        try:
            TelegramAccount.objects.update_or_create(
                user=user,
                defaults={
                    "telegram_id": telegram_id,
                    "username": telegram_username,
                },
            )
        except IntegrityError as exc:
            raise TelegramAlreadyLinkedError() from exc

        if not user.is_active:
            user.is_active = True
            user.save(update_fields=["is_active", "updated_at"])

        verification.consumed_at = timezone.now()
        verification.save(update_fields=["consumed_at", "updated_at"])

        return user
