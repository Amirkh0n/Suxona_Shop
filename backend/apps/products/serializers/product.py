from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.products.models import Product
from apps.products.serializers.category import CategorySerializer
from apps.products.serializers.product_image import ProductImageSerializer
from apps.products.serializers.product_variant import ProductVariantSerializer

# Cross-app import: target the leaf module (not apps.stores.serializers) to
# keep the import graph acyclic. Do not change to the package __init__.
from apps.stores.serializers.store import StoreListSerializer


class ProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "stock",
            "status",
            "store_id",
            "category_id",
            "primary_image",
        ]
        read_only_fields = fields

    @extend_schema_field(ProductImageSerializer(allow_null=True))
    def get_primary_image(self, obj):
        for image in obj.images.all():
            if image.is_primary:
                return ProductImageSerializer(image).data
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    store = StoreListSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    is_approved = serializers.SerializerMethodField()

    @extend_schema_field(serializers.BooleanField())
    def get_is_approved(self, obj) -> bool:
        return obj.approved_at is not None

    class Meta:
        model = Product
        fields = [
            "id",
            "store",
            "category",
            "name",
            "description",
            "price",
            "stock",
            "status",
            "images",
            "variants",
            "moderation_note",
            "is_approved",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class ProductCreateSerializer(serializers.Serializer):
    category_id = serializers.IntegerField(min_value=1)
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    stock = serializers.IntegerField(min_value=0, required=False, allow_null=True)


class ProductUpdateSerializer(serializers.Serializer):
    category_id = serializers.IntegerField(min_value=1, required=False)
    name = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=0,
        required=False,
    )
    stock = serializers.IntegerField(min_value=0, required=False, allow_null=True)
    status = serializers.CharField(max_length=20, required=False)
