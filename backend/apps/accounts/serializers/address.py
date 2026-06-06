from rest_framework import serializers

from apps.accounts.models import Address
# Cross-app import: target the leaf module (not apps.stores.serializers) to
# keep the import graph acyclic. Do not change to the package __init__.
from apps.stores.serializers.village import VillageSerializer


class AddressListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "village",
            "street",
            "house",
            "landmark",
            "is_default",
        ]
        read_only_fields = fields


class AddressDetailSerializer(serializers.ModelSerializer):
    village = VillageSerializer(read_only=True)

    class Meta:
        model = Address
        fields = [
            "id",
            "village",
            "street",
            "house",
            "landmark",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class AddressCreateSerializer(serializers.Serializer):
    village_id = serializers.IntegerField(min_value=1)
    street = serializers.CharField(max_length=255)
    house = serializers.CharField(max_length=100)
    landmark = serializers.CharField(max_length=255, required=False, allow_blank=True)
    is_default = serializers.BooleanField(required=False, default=False)


class AddressUpdateSerializer(serializers.Serializer):
    village_id = serializers.IntegerField(min_value=1, required=False)
    street = serializers.CharField(max_length=255, required=False)
    house = serializers.CharField(max_length=100, required=False)
    landmark = serializers.CharField(max_length=255, required=False, allow_blank=True)
    is_default = serializers.BooleanField(required=False)
