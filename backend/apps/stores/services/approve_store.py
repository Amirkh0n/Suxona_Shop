from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.common.enums import StoreApplicationStatus, StoreStatus
from apps.notifications.telegram.services import (
    after_commit,
    notify_store_application_approved,
)
from apps.stores.exceptions import (
    InvalidStoreApplicationStatusError,
    StoreApplicationNotFound,
    UserAlreadyHasStoreError,
)
from apps.stores.models import Store, StoreApplication


class ApproveStoreService:
    @staticmethod
    @transaction.atomic
    def execute(*, application: StoreApplication, reviewed_by: User | None = None) -> Store:
        try:
            application = StoreApplication.objects.select_for_update().get(
                pk=application.pk,
            )
        except StoreApplication.DoesNotExist as exc:
            raise StoreApplicationNotFound() from exc

        if application.status != StoreApplicationStatus.PENDING:
            raise InvalidStoreApplicationStatusError()

        if Store.objects.filter(owner=application.owner).exists():
            raise UserAlreadyHasStoreError()

        # The Store.owner OneToOneField guards against a race where two
        # approvals run concurrently for the same owner.
        try:
            store = Store.objects.create(
                owner=application.owner,
                name=application.store_name,
                phone=application.phone,
                status=StoreStatus.ACTIVE,
            )
        except IntegrityError as exc:
            raise UserAlreadyHasStoreError() from exc

        application.status = StoreApplicationStatus.APPROVED
        application.reviewed_by = reviewed_by
        application.reviewed_at = timezone.now()
        application.save(
            update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"],
        )

        # Sent only once the transaction actually commits: if anything above
        # rolls back, the applicant must not get a "congratulations" message
        # for a store that was never created.
        after_commit(
            notify_store_application_approved,
            owner=application.owner,
            store_name=store.name,
        )

        return store
