from rest_framework import serializers

from apps.orders.models import OrderItem
# Cross-app import: target the leaf module (not apps.products.serializers) to
# keep the import graph acyclic. Do not change to the package __init__.
from apps.products.serializers.product import ProductListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "price",
            "quantity",
            "subtotal",
        ]
        read_only_fields = fields
