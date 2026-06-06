from typing import Any

from django.db import transaction

from apps.accounts.models import User
from apps.stores.exceptions import NotStoreOwnerError, StoreNotFound
from apps.stores.models import Store


class UpdateStoreService:
    """Update a store's profile fields.

    Business rules:
    - Only the store owner may update the store.
    - Store status cannot be changed here (status transitions belong to the
      admin suspend/activate services).
    """

    UPDATABLE_FIELDS = (
        "name",
        "description",
        "phone",
        "telegram_username",
        "logo",
        "banner",
    )

    @staticmethod
    @transaction.atomic
    def execute(*, store: Store, actor: User, **fields: Any) -> Store:
        locked_store = (
            Store.objects.select_for_update().filter(pk=store.pk).first()
        )
        if locked_store is None:
            raise StoreNotFound()

        if locked_store.owner_id != actor.pk:
            raise NotStoreOwnerError()

        update_fields: list[str] = []
        for field in UpdateStoreService.UPDATABLE_FIELDS:
            if field in fields and fields[field] is not None:
                setattr(locked_store, field, fields[field])
                update_fields.append(field)

        if update_fields:
            update_fields.append("updated_at")
            locked_store.save(update_fields=update_fields)

        return locked_store
