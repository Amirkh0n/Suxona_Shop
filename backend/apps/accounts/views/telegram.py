from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import TelegramAccount
from apps.accounts.serializers import (
    TelegramAccountSerializer,
    TelegramLinkSerializer,
)
from apps.accounts.services import LinkTelegramService
from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAuthenticatedUser


class TelegramLinkView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def post(self, request: Request) -> Response:
        serializer = TelegramLinkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            account = LinkTelegramService.execute(
                user=request.user,
                **serializer.validated_data,
            )
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            TelegramAccountSerializer(account).data,
            status=status.HTTP_200_OK,
        )


class TelegramMeView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request: Request) -> Response:
        account = (
            TelegramAccount.objects.filter(user=request.user).first()
        )
        if account is None:
            return Response(
                {"detail": "Telegram account is not linked."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            TelegramAccountSerializer(account).data,
            status=status.HTTP_200_OK,
        )
