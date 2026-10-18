from rest_framework import serializers

from apps.products.models import ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "is_primary", "sort_order"]
        read_only_fields = fields


class ProductImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()
    is_primary = serializers.BooleanField(required=False, default=False)
    sort_order = serializers.IntegerField(min_value=0, required=False, default=0)


class ProductImageReorderSerializer(serializers.Serializer):
    images = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )
