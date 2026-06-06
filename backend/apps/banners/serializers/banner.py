from rest_framework import serializers

from apps.banners.models import Banner


class BannerListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ["id", "title", "image", "url", "sort_order"]
        read_only_fields = fields


class BannerDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = [
            "id",
            "title",
            "image",
            "url",
            "is_active",
            "sort_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class BannerCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    image = serializers.ImageField()
    url = serializers.URLField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False, default=True)
    sort_order = serializers.IntegerField(min_value=0, required=False, default=0)


class BannerUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=False)
    image = serializers.ImageField(required=False)
    url = serializers.URLField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False)
    sort_order = serializers.IntegerField(min_value=0, required=False)
