from django.db import IntegrityError, transaction

from apps.accounts.exceptions import PhoneAlreadyRegisteredError
from apps.accounts.models import User, VerificationToken


class RegisterUserService:
    """Register a new (inactive) user and issue a Telegram verification token.

    The created user is inactive until they complete Telegram verification.
    Returns the user together with its verification token so the API can
    build a Telegram deep link.
    """

    @staticmethod
    @transaction.atomic
    def execute(
        *,
        phone: str,
        password: str,
        first_name: str,
        last_name: str = "",
    ) -> tuple[User, VerificationToken]:
        if User.objects.filter(phone=phone).exists():
            raise PhoneAlreadyRegisteredError()

        try:
            user = User.objects.create_user(
                phone=phone,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_active=False,
            )
        except IntegrityError as exc:
            raise PhoneAlreadyRegisteredError() from exc

        verification = VerificationToken.objects.create(user=user)
        return user, verification
