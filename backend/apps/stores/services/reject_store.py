from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.common.enums import StoreApplicationStatus
from apps.stores.exceptions import (
    InvalidStoreApplicationStatusError,
    StoreApplicationNotFound,
)
from apps.stores.models import StoreApplication


class RejectStoreService:
    @staticmethod
    @transaction.atomic
    def execute(
        *,
        application: StoreApplication,
        admin_note: str = "",
        reviewed_by: User | None = None,
    ) -> StoreApplication:
        try:
            application = StoreApplication.objects.select_for_update().get(
                pk=application.pk,
            )
        except StoreApplication.DoesNotExist as exc:
            raise StoreApplicationNotFound() from exc

        if application.status != StoreApplicationStatus.PENDING:
            raise InvalidStoreApplicationStatusError()

        application.status = StoreApplicationStatus.REJECTED
        application.admin_note = admin_note
        application.reviewed_by = reviewed_by
        application.reviewed_at = timezone.now()
        application.save(
            update_fields=[
                "status",
                "admin_note",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ],
        )

        # Sent only after commit so a rolled-back rejection never notifies.
        def _notify() -> None:
            from apps.notifications.telegram.services import (
                notify_store_application_rejected,
            )

            notify_store_application_rejected(
                owner=application.owner,
                store_name=application.store_name,
                admin_note=application.admin_note,
            )

        transaction.on_commit(_notify)

        return application
