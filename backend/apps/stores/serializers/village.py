from rest_framework import serializers

from apps.stores.models import Village


class VillageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Village
        fields = ["id", "name", "district", "is_active"]
        read_only_fields = fields


class VillageCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    district = serializers.CharField(max_length=255)
    is_active = serializers.BooleanField(required=False, default=True)


class VillageUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    district = serializers.CharField(max_length=255, required=False)
    is_active = serializers.BooleanField(required=False)
