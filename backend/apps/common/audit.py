import logging

from apps.common.models import AuditLog

logger = logging.getLogger(__name__)


def record(actor, action: str, target, summary: str = "") -> None:
    """Write an audit entry. Never raises: auditing must not break the action it describes."""
    try:
        AuditLog.objects.create(
            actor=actor if getattr(actor, "pk", None) else None,
            action=action,
            target_type=target._meta.model_name,
            target_id=str(target.pk),
            summary=summary[:300],
        )
    except Exception:  # noqa: BLE001
        logger.exception("Audit log write failed for %s", action)
