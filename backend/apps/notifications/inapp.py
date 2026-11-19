"""Create in-app notifications. Best-effort: a failure here must never break a request."""

import logging

from apps.notifications.models import Notification

logger = logging.getLogger(__name__)


def create_notification(user, *, kind: str, title: str, body: str = "", link: str = "") -> None:
    try:
        Notification.objects.create(user=user, kind=kind, title=title, body=body, link=link)
    except Exception:  # noqa: BLE001
        logger.exception("Could not create in-app notification for user_id=%s", user.pk)
