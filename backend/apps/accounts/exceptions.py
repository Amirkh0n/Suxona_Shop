from apps.common.exceptions import ServiceError


class AccountServiceError(ServiceError):
    default_message = "Account service error."


class PhoneAlreadyRegisteredError(AccountServiceError):
    default_message = "A user with this phone already exists."


class VillageNotFoundError(AccountServiceError):
    default_message = "Village was not found."


class TelegramAlreadyLinkedError(AccountServiceError):
    default_message = "This Telegram account is already linked to another user."


class InvalidCredentialsError(AccountServiceError):
    default_message = "Invalid phone or password."


class AccountNotVerifiedError(AccountServiceError):
    default_message = "Account is not verified. Complete Telegram verification first."


class InvalidVerificationTokenError(AccountServiceError):
    default_message = "Verification token is invalid."


class VerificationExpiredError(AccountServiceError):
    default_message = "Verification token has expired or already been used."
