from django.db import IntegrityError, transaction

from apps.common.enums import StoreApplicationStatus, StoreStatus
from apps.stores.exceptions import (
    InvalidStoreApplicationStatusError,
    StoreApplicationNotFound,
    UserAlreadyHasStoreError,
)
from apps.stores.models import Store, StoreApplication


class ApproveStoreService:
    @staticmethod
    @transaction.atomic
    def execute(*, application: StoreApplication) -> Store:
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
        application.save(update_fields=["status", "updated_at"])

        return store
