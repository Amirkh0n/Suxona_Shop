from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.exceptions import (
    InvalidVerificationTokenError,
    TelegramAlreadyLinkedError,
    VerificationExpiredError,
)
from apps.accounts.serializers import TelegramVerifySerializer
from apps.accounts.services import VerifyTelegramRegistrationService
from apps.common.exceptions import ServiceError

_SECRET_HEADER = "X-Telegram-Bot-Api-Secret-Token"


class TelegramVerifyView(APIView):
    """Intake endpoint for the Telegram bot to complete registration
    verification. Secured by a shared secret header so only the configured
    bot backend can call it."""

    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request: Request) -> Response:
        expected = settings.TELEGRAM_WEBHOOK_SECRET
        # Fail closed: a missing/empty secret means the endpoint is not
        # configured for secure operation, so refuse rather than accept
        # unauthenticated verification calls.
        if not expected:
            return Response(
                {"detail": "Telegram verification is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        provided = request.headers.get(_SECRET_HEADER, "")
        if provided != expected:
            return Response(
                {"detail": "Forbidden."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TelegramVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = VerifyTelegramRegistrationService.execute(
                token=serializer.validated_data["token"],
                telegram_id=serializer.validated_data["telegram_id"],
                telegram_username=serializer.validated_data.get(
                    "telegram_username", ""
                ),
            )
        except InvalidVerificationTokenError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except VerificationExpiredError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_410_GONE)
        except TelegramAlreadyLinkedError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"id": user.id, "phone": user.phone, "is_active": user.is_active},
            status=status.HTTP_200_OK,
        )
