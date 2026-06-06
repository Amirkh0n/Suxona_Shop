from apps.accounts.exceptions import (
    AccountNotVerifiedError,
    InvalidCredentialsError,
)
from apps.accounts.models import User
from apps.accounts.selectors import UserSelector


class AuthenticateUserService:
    """Authenticate a user by phone + password.

    Uses Django password hashing. Only verified (active) users may
    authenticate. Credential errors are intentionally generic to avoid
    user enumeration; the not-verified signal is only returned after the
    password has been verified.
    """

    @staticmethod
    def execute(*, phone: str, password: str) -> User:
        user = UserSelector.get_user_by_phone(phone)

        # Run check_password even when user is None? We cannot without a user;
        # return a generic error to avoid leaking which phones are registered.
        if user is None or not user.check_password(password):
            raise InvalidCredentialsError()

        if not user.is_active:
            raise AccountNotVerifiedError()

        return user
