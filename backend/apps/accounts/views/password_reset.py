"""Forgot-password flow: a 6-digit code is delivered to the user's linked Telegram."""

import secrets
from datetime import timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts import security
from apps.accounts.models import TelegramAccount, User
from apps.accounts.models.password_reset import (
    RESET_CODE_TTL,
    PasswordResetCode,
)
from apps.accounts.serializers.user import validate_new_password
from apps.notifications.telegram import client

PHONE_RE = r"^\+?\d{9,15}$"
RESEND_AFTER = timedelta(seconds=60)


class ResetRequestSerializer(serializers.Serializer):
    phone = serializers.RegexField(PHONE_RE)


class ResetConfirmSerializer(serializers.Serializer):
    phone = serializers.RegexField(PHONE_RE)
    code = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(min_length=8, max_length=128, write_only=True)


def _find_user(phone: str) -> User | None:
    phone = phone.strip()
    candidates = {phone, phone.lstrip("+"), "+" + phone.lstrip("+")}
    return User.objects.filter(phone__in=candidates).first()


@extend_schema(tags=["Auth"])
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "auth"

    @extend_schema(
        summary="Send a password reset code to the linked Telegram",
        request=ResetRequestSerializer,
    )
    def post(self, request: Request) -> Response:
        ser = ResetRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = _find_user(ser.validated_data["phone"])
        account = TelegramAccount.objects.filter(user=user).first() if user else None
        # Same answer whether or not the phone exists: no account enumeration.
        generic = Response({"detail": "Agar raqam topilsa, kod Telegram'ga yuborildi."})
        if user is None or account is None:
            return generic
        recent = PasswordResetCode.objects.filter(
            user=user, created_at__gt=timezone.now() - RESEND_AFTER
        ).exists()
        if recent:
            return generic
        code = f"{secrets.randbelow(10**6):06d}"
        PasswordResetCode.objects.create(
            user=user,
            code_hash=make_password(code),
            expires_at=timezone.now() + RESET_CODE_TTL,
        )
        client.send_message(
            account.telegram_id,
            f"🔐 Parolni tiklash kodi: <b>{code}</b>\n10 daqiqa amal qiladi. "
            "Bu kodni boshqalarga bermang.",
        )
        return generic


@extend_schema(tags=["Auth"])
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "auth"

    @extend_schema(summary="Set a new password using the code", request=ResetConfirmSerializer)
    def post(self, request: Request) -> Response:
        ser = ResetConfirmSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        bad = Response(
            {"detail": "Kod noto'g'ri yoki muddati tugagan."}, status=status.HTTP_400_BAD_REQUEST
        )
        user = _find_user(ser.validated_data["phone"])
        if user is None:
            return bad
        with transaction.atomic():
            entry = (
                PasswordResetCode.objects.select_for_update()
                .filter(user=user, used_at__isnull=True)
                .order_by("-created_at")
                .first()
            )
            if entry is None or not entry.is_usable():
                return bad
            if not check_password(ser.validated_data["code"], entry.code_hash):
                entry.attempts += 1
                entry.save(update_fields=["attempts", "updated_at"])
                return bad
            validate_new_password(ser.validated_data["new_password"], user)
            user.set_password(ser.validated_data["new_password"])
            user.save(update_fields=["password"])
            entry.used_at = timezone.now()
            entry.save(update_fields=["used_at", "updated_at"])
            PasswordResetCode.objects.filter(user=user, used_at__isnull=True).update(
                used_at=timezone.now()
            )
            # A reset means the old credentials may be compromised: end every session.
            security.revoke_all_tokens(user)
            security.clear_failures(user.phone)
        return Response({"detail": "Parol yangilandi."})
