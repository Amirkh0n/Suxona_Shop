from rest_framework import serializers

from apps.products.models import ProductReview


class ProductReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()

    def get_customer_name(self, obj) -> str:
        return obj.customer.first_name or "Xaridor"

    class Meta:
        model = ProductReview
        fields = [
            "id", "rating", "comment", "customer_name", "created_at",
            "seller_reply", "seller_replied_at",
        ]
        read_only_fields = fields


class ProductReviewCreateSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=1000)
