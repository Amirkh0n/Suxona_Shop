from rest_framework import serializers

from apps.accounts.models import TelegramAccount


class TelegramAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelegramAccount
        fields = ["id", "telegram_id", "username", "linked_at"]
        read_only_fields = fields


class TelegramLinkSerializer(serializers.Serializer):
    telegram_id = serializers.CharField(max_length=64)
    username = serializers.CharField(max_length=255, required=False, allow_blank=True)
