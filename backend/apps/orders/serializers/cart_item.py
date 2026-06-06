from rest_framework import serializers

from apps.orders.models import CartItem
# Cross-app import: target the leaf module (not apps.products.serializers) to
# keep the import graph acyclic. Do not change to the package __init__.
from apps.products.serializers.product import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "quantity",
        ]
        read_only_fields = fields


class CartItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1)


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
