from django.urls import path

from apps.notifications.views import TelegramWebhookView

urlpatterns = [
    path("telegram/webhook", TelegramWebhookView.as_view(), name="telegram-webhook"),
]
