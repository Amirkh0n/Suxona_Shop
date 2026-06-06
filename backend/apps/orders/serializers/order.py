from rest_framework import serializers

# Cross-app imports: target leaf modules (not the package __init__) to keep
# the import graph acyclic. Do not change to package-level imports.
from apps.accounts.serializers.address import AddressDetailSerializer
from apps.accounts.serializers.user import UserCompactSerializer
from apps.orders.models import Order
from apps.orders.serializers.order_item import OrderItemSerializer
from apps.stores.serializers.store import StoreListSerializer


class OrderListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id",
            "store_id",
            "status",
            "subtotal",
            "delivery_price",
            "total",
            "created_at",
        ]
        read_only_fields = fields


class OrderDetailSerializer(serializers.ModelSerializer):
    customer = UserCompactSerializer(read_only=True)
    store = StoreListSerializer(read_only=True)
    address = AddressDetailSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer",
            "store",
            "address",
            "delivery_price",
            "subtotal",
            "total",
            "status",
            "note",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class OrderCreateSerializer(serializers.Serializer):
    store_id = serializers.IntegerField(min_value=1)
    address_id = serializers.IntegerField(min_value=1)
    note = serializers.CharField(required=False, allow_blank=True)


class OrderRejectSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
