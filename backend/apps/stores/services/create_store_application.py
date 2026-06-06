from django.db import transaction

from apps.accounts.models import User
from apps.common.enums import StoreApplicationStatus
from apps.stores.exceptions import (
    PendingStoreApplicationExistsError,
    UserAlreadyHasStoreError,
)
from apps.stores.models import Store, StoreApplication


class CreateStoreApplicationService:
    @staticmethod
    @transaction.atomic
    def execute(*, owner: User, store_name: str, phone: str) -> StoreApplication:
        # Lock the owner row to serialize concurrent application/approval
        # requests for the same user and prevent duplicate pending applications.
        owner = User.objects.select_for_update().get(pk=owner.pk)

        if Store.objects.filter(owner=owner).exists():
            raise UserAlreadyHasStoreError()

        has_pending_application = (
            StoreApplication.objects.select_for_update()
            .filter(owner=owner, status=StoreApplicationStatus.PENDING)
            .exists()
        )
        if has_pending_application:
            raise PendingStoreApplicationExistsError()

        return StoreApplication.objects.create(
            owner=owner,
            store_name=store_name,
            phone=phone,
            status=StoreApplicationStatus.PENDING,
        )
