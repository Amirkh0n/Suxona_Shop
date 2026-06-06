"""Documentation-only serializers used to describe API responses for
drf-spectacular. These are not used by business logic; they exist solely so
the OpenAPI schema can render accurate response bodies for APIViews that
return plain dictionaries."""

from rest_framework import serializers


class DetailSerializer(serializers.Serializer):
    """Generic ``{"detail": "..."}`` message response."""

    detail = serializers.CharField()


class TokenPairSerializer(serializers.Serializer):
    """JWT access/refresh token pair returned on login."""

    access = serializers.CharField()
    refresh = serializers.CharField()


class RegisterResponseSerializer(serializers.Serializer):
    """Response body for successful registration."""

    id = serializers.IntegerField()
    phone = serializers.CharField()
    is_active = serializers.BooleanField()
    telegram_deeplink = serializers.CharField()


class TelegramVerifyResponseSerializer(serializers.Serializer):
    """Response body for a successful Telegram verification."""

    id = serializers.IntegerField()
    phone = serializers.CharField()
    is_active = serializers.BooleanField()


class CartStoreGroupResponseSerializer(serializers.Serializer):
    """A single store group within the cart response."""

    store_id = serializers.IntegerField()
    store_name = serializers.CharField()


class CartResponseSerializer(serializers.Serializer):
    """Cart grouped by store."""

    stores = CartStoreGroupResponseSerializer(many=True)
