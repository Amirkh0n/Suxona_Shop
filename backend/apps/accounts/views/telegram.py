from drf_spectacular.utils import OpenApiResponse, extend_schema
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
from apps.common.schema import DetailSerializer


@extend_schema(tags=["Users"])
class TelegramLinkView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(
        summary="Link Telegram account",
        request=TelegramLinkSerializer,
        responses={
            200: TelegramAccountSerializer,
            400: OpenApiResponse(DetailSerializer, "Service error."),
        },
    )
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


@extend_schema(tags=["Users"])
class TelegramMeView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(
        summary="Get my Telegram account",
        responses={
            200: TelegramAccountSerializer,
            404: OpenApiResponse(DetailSerializer, "Not linked."),
        },
    )
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
