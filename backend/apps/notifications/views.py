import hmac
import logging

from django.conf import settings
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.telegram.bot import handle_update

logger = logging.getLogger(__name__)

SECRET_HEADER = "X-Telegram-Bot-Api-Secret-Token"


@extend_schema(exclude=True)  # Telegram-facing, not part of the public API
class TelegramWebhookView(APIView):
    """Receives updates pushed by Telegram (``setWebhook``).

    Authenticity: Telegram echoes the ``secret_token`` we registered in the
    ``X-Telegram-Bot-Api-Secret-Token`` header; anything else is rejected.
    Updates are processed synchronously, and we always answer 200 once the
    secret checks out — a non-200 makes Telegram retry the same update, which
    would just repeat whatever failed.
    """

    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes: list = []  # Telegram's IPs, protected by the secret instead

    def post(self, request: Request) -> Response:
        expected = settings.TELEGRAM_WEBHOOK_SECRET
        if not expected:
            # Fail closed: without a secret anyone could forge updates.
            return Response(
                {"detail": "Telegram webhook is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        provided = request.headers.get(SECRET_HEADER, "")
        if not hmac.compare_digest(provided.encode(), expected.encode()):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        try:
            handle_update(request.data)
        except Exception:  # noqa: BLE001
            logger.exception("Failed to handle Telegram update")

        return Response({"ok": True})
