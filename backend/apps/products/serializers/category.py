from rest_framework import serializers

from apps.products.models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "parent", "name", "icon", "is_active"]
        read_only_fields = fields


class CategoryTreeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "icon", "is_active", "children"]
        read_only_fields = fields

    def get_children(self, obj) -> list:
        children = obj.children.all()
        return CategorySerializer(children, many=True).data


class CategoryCreateSerializer(serializers.Serializer):
    parent_id = serializers.IntegerField(min_value=1, required=False, allow_null=True)
    name = serializers.CharField(max_length=255)
    icon = serializers.ImageField(required=False)
    is_active = serializers.BooleanField(required=False, default=True)


class CategoryUpdateSerializer(serializers.Serializer):
    parent_id = serializers.IntegerField(min_value=1, required=False, allow_null=True)
    name = serializers.CharField(max_length=255, required=False)
    icon = serializers.ImageField(required=False)
    is_active = serializers.BooleanField(required=False)
