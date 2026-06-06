from typing import Any

from django.db import transaction

from apps.accounts.exceptions import VillageNotFoundError
from apps.accounts.models import Address
from apps.stores.models import Village


class UpdateAddressService:
    UPDATABLE_FIELDS = ("street", "house", "landmark")

    @staticmethod
    @transaction.atomic
    def execute(*, address: Address, **fields: Any) -> Address:
        update_fields: list[str] = []

        village_id = fields.get("village_id")
        if village_id is not None:
            if not Village.objects.filter(pk=village_id).exists():
                raise VillageNotFoundError()
            address.village_id = village_id
            update_fields.append("village")

        for field in UpdateAddressService.UPDATABLE_FIELDS:
            if field in fields and fields[field] is not None:
                setattr(address, field, fields[field])
                update_fields.append(field)

        is_default = fields.get("is_default")
        if is_default is not None:
            if is_default:
                Address.objects.filter(
                    user_id=address.user_id,
                    is_default=True,
                ).exclude(pk=address.pk).update(is_default=False)
            address.is_default = is_default
            update_fields.append("is_default")

        if update_fields:
            update_fields.append("updated_at")
            address.save(update_fields=update_fields)

        return address
