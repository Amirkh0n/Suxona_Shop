from rest_framework import serializers

from apps.products.models import ProductVariant


class ProductVariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "sku",
            "attributes",
            "price",
            "effective_price",
            "stock",
            "is_active",
        ]
        read_only_fields = ["id", "effective_price"]

    def get_effective_price(self, obj):
        return obj.effective_price()

    def validate_attributes(self, value):
        if not isinstance(value, dict) or not value:
            raise serializers.ValidationError("At least one variant attribute is required.")
        if any(not isinstance(key, str) or not key.strip() for key in value):
            raise serializers.ValidationError("Variant attribute names must be non-empty strings.")
        if any(not isinstance(item, (str, int, float, bool)) for item in value.values()):
            raise serializers.ValidationError("Variant attribute values must be scalar values.")
        return value


class ProductVariantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ["sku", "attributes", "price", "stock", "is_active"]

    validate_attributes = ProductVariantSerializer.validate_attributes


class ProductVariantUpdateSerializer(ProductVariantCreateSerializer):
    class Meta(ProductVariantCreateSerializer.Meta):
        extra_kwargs = {
            "sku": {"required": False},
            "attributes": {"required": False},
            "price": {"required": False, "allow_null": True},
            "stock": {"required": False, "allow_null": True},
            "is_active": {"required": False},
        }
