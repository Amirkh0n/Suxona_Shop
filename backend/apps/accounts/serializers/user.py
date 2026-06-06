from rest_framework import serializers

from apps.accounts.models import User


class UserCompactSerializer(serializers.ModelSerializer):
    """Lightweight user representation for nesting in other read payloads."""

    class Meta:
        model = User
        fields = ["id", "phone", "first_name"]
        read_only_fields = fields


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "phone", "first_name", "last_name", "is_active"]
        read_only_fields = fields


class RegisterSerializer(serializers.Serializer):
    """Validation-only serializer for user registration input."""

    phone = serializers.RegexField(
        regex=r"^\+?\d{9,15}$",
        max_length=20,
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        max_length=128,
        style={"input_type": "password"},
    )
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)


class LoginSerializer(serializers.Serializer):
    """Validation-only serializer for login input."""

    phone = serializers.RegexField(
        regex=r"^\+?\d{9,15}$",
        max_length=20,
    )
    password = serializers.CharField(
        write_only=True,
        max_length=128,
        style={"input_type": "password"},
    )


class TelegramVerifySerializer(serializers.Serializer):
    """Validation-only serializer for the Telegram verification intake."""

    token = serializers.CharField(max_length=64)
    telegram_id = serializers.CharField(max_length=64)
    telegram_username = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
