from rest_framework import serializers

# Cross-app import: target the leaf module (not apps.accounts.serializers) to
# keep the import graph acyclic. Do not change to the package __init__.
from apps.accounts.serializers.user import UserCompactSerializer
from apps.stores.models import Store


class StoreListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = [
            "id",
            "name",
            "logo",
            "banner",
            "status",
        ]
        read_only_fields = fields


class StoreDetailSerializer(serializers.ModelSerializer):
    owner = UserCompactSerializer(read_only=True)

    class Meta:
        model = Store
        fields = [
            "id",
            "owner",
            "name",
            "description",
            "logo",
            "banner",
            "phone",
            "telegram_username",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class StoreUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False)
    telegram_username = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
    logo = serializers.ImageField(required=False)
    banner = serializers.ImageField(required=False)
