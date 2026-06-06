from django.db import transaction

from apps.accounts.exceptions import TelegramAlreadyLinkedError
from apps.accounts.models import TelegramAccount, User


class LinkTelegramService:
    @staticmethod
    @transaction.atomic
    def execute(
        *,
        user: User,
        telegram_id: str,
        username: str = "",
    ) -> TelegramAccount:
        conflicting = (
            TelegramAccount.objects.filter(telegram_id=telegram_id)
            .exclude(user=user)
            .exists()
        )
        if conflicting:
            raise TelegramAlreadyLinkedError()

        account, _created = TelegramAccount.objects.update_or_create(
            user=user,
            defaults={
                "telegram_id": telegram_id,
                "username": username,
            },
        )
        return account
