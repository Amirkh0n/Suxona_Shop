from rest_framework import serializers

from apps.accounts.serializers.user import UserCompactSerializer
from apps.stores.models import StoreApplication


class StoreApplicationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreApplication
        fields = [
            "id",
            "store_name",
            "phone",
            "status",
            "created_at",
        ]
        read_only_fields = fields


class StoreApplicationDetailSerializer(serializers.ModelSerializer):
    owner = UserCompactSerializer(read_only=True)

    class Meta:
        model = StoreApplication
        fields = [
            "id",
            "owner",
            "store_name",
            "phone",
            "status",
            "admin_note",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class StoreApplicationCreateSerializer(serializers.Serializer):
    store_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20)


class StoreApplicationRejectSerializer(serializers.Serializer):
    admin_note = serializers.CharField(required=False, allow_blank=True)
