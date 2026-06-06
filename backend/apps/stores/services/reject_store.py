from django.db import transaction

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
        application.save(update_fields=["status", "admin_note", "updated_at"])

        return application
