from django.conf import settings
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts import security
from apps.accounts.exceptions import (
    AccountNotVerifiedError,
    InvalidCredentialsError,
)
from apps.accounts.models import User
from apps.accounts.serializers import (
    LoginSerializer,
    RefreshTokenSerializer,
    RegisterSerializer,
    UserDetailSerializer,
)
from apps.accounts.services import (
    AuthenticateUserService,
    RegisterUserService,
)
from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAuthenticatedUser
from apps.common.schema import (
    DetailSerializer,
    RegisterResponseSerializer,
    TokenPairSerializer,
)


def _telegram_deeplink(token: str) -> str:
    return f"https://t.me/{settings.TELEGRAM_BOT_USERNAME}?start=verify_{token}"


@extend_schema(tags=["Auth"])
class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "auth"

    @extend_schema(
        summary="Register a new user",
        description=(
            "Creates an inactive user and returns a Telegram deep link the "
            "user must open to verify and activate their account."
        ),
        request=RegisterSerializer,
        responses={
            201: RegisterResponseSerializer,
            400: OpenApiResponse(DetailSerializer, "Validation or service error."),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user, verification = RegisterUserService.execute(
                **serializer.validated_data
            )
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "id": user.id,
                "phone": user.phone,
                "is_active": user.is_active,
                "telegram_deeplink": _telegram_deeplink(verification.token),
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Auth"])
class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "auth"

    @extend_schema(
        summary="Obtain JWT tokens",
        description="Authenticates a user by phone + password and returns a JWT pair.",
        request=LoginSerializer,
        responses={
            200: TokenPairSerializer,
            401: OpenApiResponse(DetailSerializer, "Invalid credentials."),
            403: OpenApiResponse(DetailSerializer, "Account not verified."),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]

        if security.is_locked(phone):
            return Response(
                {"detail": "Juda ko'p urinish. 15 daqiqadan so'ng qayta urinib ko'ring."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        try:
            user = AuthenticateUserService.execute(
                phone=phone,
                password=serializer.validated_data["password"],
            )
        except InvalidCredentialsError as exc:
            security.register_failure(phone)
            return Response(
                {"detail": str(exc)}, status=status.HTTP_401_UNAUTHORIZED
            )
        except AccountNotVerifiedError as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN
            )
        except ServiceError as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )

        security.clear_failures(phone)
        refresh = RefreshToken.for_user(user)
        return Response(
            {"access": str(refresh.access_token), "refresh": str(refresh)},
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Auth"])
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(
        summary="Get current user",
        responses={200: UserDetailSerializer},
    )
    def get(self, request: Request) -> Response:
        return Response(
            UserDetailSerializer(request.user).data,
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Auth"])
class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Refresh an access token",
        request=RefreshTokenSerializer,
        responses={
            200: TokenPairSerializer,
            401: OpenApiResponse(
                DetailSerializer,
                "Invalid or expired refresh token.",
            ),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        invalid = Response(
            {"detail": "Invalid or expired refresh token."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
        try:
            old = RefreshToken(serializer.validated_data["refresh"])  # rejects blacklisted
            user = User.objects.filter(pk=old["user_id"], is_active=True).first()
            if user is None:
                return invalid
            # Rotation: the presented token is burned, a fresh pair is issued.
            try:
                old.blacklist()
            except TokenError:
                return invalid
        except TokenError:
            return invalid

        fresh = RefreshToken.for_user(user)
        return Response(
            {"access": str(fresh.access_token), "refresh": str(fresh)},
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Auth"])
class LogoutView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Revoke a refresh token (log out)",
        request=RefreshTokenSerializer,
        responses={204: None},
    )
    def post(self, request: Request) -> Response:
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            RefreshToken(serializer.validated_data["refresh"]).blacklist()
        except TokenError:
            pass  # already invalid: nothing to revoke
        return Response(status=status.HTTP_204_NO_CONTENT)
