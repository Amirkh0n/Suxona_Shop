from rest_framework import serializers

from apps.orders.models import CartItem

# Cross-app import: target the leaf module (not apps.products.serializers) to
# keep the import graph acyclic. Do not change to the package __init__.
from apps.products.serializers.product import ProductListSerializer
from apps.products.serializers.product_variant import ProductVariantSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "variant",
            "quantity",
        ]
        read_only_fields = fields


class CartItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    variant_id = serializers.IntegerField(min_value=1, required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1)


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
