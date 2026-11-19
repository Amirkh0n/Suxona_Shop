from rest_framework import serializers

# Cross-app import: target the leaf module (not apps.accounts.serializers) to
# keep the import graph acyclic. Do not change to the package __init__.
from apps.accounts.serializers.user import UserCompactSerializer
from apps.stores.models import Store, StoreReview


class StoreListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = [
            "id",
            "name",
            "logo",
            "banner",
            "status",
            "rating_avg",
            "rating_count",
            "min_order_amount",
            "delivery_time",
            "allows_pickup",
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
            "rating_avg",
            "rating_count",
            "min_order_amount",
            "opens_at",
            "closes_at",
            "delivery_time",
            "allows_pickup",
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
    min_order_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False
    )
    opens_at = serializers.TimeField(required=False, allow_null=True)
    closes_at = serializers.TimeField(required=False, allow_null=True)
    delivery_time = serializers.CharField(max_length=60, required=False, allow_blank=True)
    allows_pickup = serializers.BooleanField(required=False)


class StoreReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()

    def get_customer_name(self, obj) -> str:
        # First name only: reviews are public, do not leak phone numbers.
        return obj.customer.first_name or "Xaridor"

    class Meta:
        model = StoreReview
        fields = ["id", "rating", "comment", "customer_name", "created_at"]
        read_only_fields = fields


class StoreReviewCreateSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=1000)
