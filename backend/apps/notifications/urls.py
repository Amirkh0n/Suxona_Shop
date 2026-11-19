from django.urls import path

from apps.notifications.inapp_views import (
    NotificationListView,
    NotificationReadAllView,
    NotificationReadView,
    NotificationUnreadCountView,
)
from apps.notifications.views import TelegramWebhookView

urlpatterns = [
    path("telegram/webhook", TelegramWebhookView.as_view(), name="telegram-webhook"),
    path("notifications", NotificationListView.as_view(), name="notification-list"),
    path(
        "notifications/unread-count",
        NotificationUnreadCountView.as_view(),
        name="notification-unread-count",
    ),
    path("notifications/read-all", NotificationReadAllView.as_view(), name="notification-read-all"),
    path(
        "notifications/<int:notification_id>/read",
        NotificationReadView.as_view(),
        name="notification-read",
    ),
]
