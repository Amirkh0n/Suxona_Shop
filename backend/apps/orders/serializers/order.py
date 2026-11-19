from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

# Cross-app imports: target leaf modules (not the package __init__) to keep
# the import graph acyclic. Do not change to package-level imports.
from apps.accounts.serializers.address import AddressDetailSerializer
from apps.accounts.serializers.user import UserCompactSerializer
from apps.common.enums import DeliveryMethod
from apps.orders.models import Order
from apps.orders.serializers.order_item import OrderItemSerializer
from apps.stores.serializers.store import StoreListSerializer, StoreReviewSerializer


class OrderListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id",
            "store_id",
            "status",
            "delivery_method",
            "subtotal",
            "delivery_price",
            "total",
            "created_at",
        ]
        read_only_fields = fields


class OrderDetailSerializer(serializers.ModelSerializer):
    customer = UserCompactSerializer(read_only=True)
    store = StoreListSerializer(read_only=True)
    address = AddressDetailSerializer(read_only=True, allow_null=True)
    review = serializers.SerializerMethodField()

    @extend_schema_field(StoreReviewSerializer(allow_null=True))
    def get_review(self, obj):
        review = getattr(obj, "review", None)
        return StoreReviewSerializer(review).data if review else None
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer",
            "store",
            "address",
            "delivery_method",
            "contact_name",
            "contact_phone",
            "delivery_price",
            "subtotal",
            "total",
            "status",
            "note",
            "items",
            "review",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class OrderCreateSerializer(serializers.Serializer):
    store_id = serializers.IntegerField(min_value=1)
    # Required for DELIVERY, ignored for PICKUP.
    address_id = serializers.IntegerField(min_value=1, required=False, allow_null=True)
    delivery_method = serializers.ChoiceField(
        choices=DeliveryMethod.choices, default=DeliveryMethod.DELIVERY
    )
    contact_name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    contact_phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    note = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs["delivery_method"] == DeliveryMethod.DELIVERY and not attrs.get("address_id"):
            raise serializers.ValidationError({"address_id": "Required for delivery orders."})
        return attrs


class OrderRejectSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
