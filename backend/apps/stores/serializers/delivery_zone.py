from rest_framework import serializers

from apps.stores.models import DeliveryZone
from apps.stores.serializers.village import VillageSerializer


class DeliveryZoneListSerializer(serializers.ModelSerializer):
    village = VillageSerializer(read_only=True)

    class Meta:
        model = DeliveryZone
        fields = [
            "id",
            "village",
            "delivery_price",
            "is_active",
        ]
        read_only_fields = fields


class DeliveryZoneCreateSerializer(serializers.Serializer):
    village_id = serializers.IntegerField(min_value=1)
    delivery_price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    is_active = serializers.BooleanField(required=False, default=True)


class DeliveryZoneUpdateSerializer(serializers.Serializer):
    delivery_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=0,
        required=False,
    )
    is_active = serializers.BooleanField(required=False)
