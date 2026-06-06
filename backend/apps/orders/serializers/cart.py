from rest_framework import serializers

from apps.orders.serializers.cart_item import CartItemSerializer


class CartStoreGroupSerializer(serializers.Serializer):
    """Read-only representation of cart items grouped by store.

    The view/selector layer is responsible for assembling the grouped
    structure; this serializer only shapes the output.
    """

    store_id = serializers.IntegerField(read_only=True)
    store_name = serializers.CharField(read_only=True)
    items = CartItemSerializer(many=True, read_only=True)


class CartSerializer(serializers.Serializer):
    stores = CartStoreGroupSerializer(many=True, read_only=True)
