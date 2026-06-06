from typing import Any

from django.db import IntegrityError, transaction

from apps.stores.exceptions import DuplicateVillageError, VillageNotFound
from apps.stores.models import Village


class UpdateVillageService:
    """Update a village (admin-managed entity).

    Business rules:
    - (name, district) must remain unique.
    - Soft business validation only; respects the is_active flag.
    """

    UPDATABLE_FIELDS = ("name", "district", "is_active")

    @staticmethod
    @transaction.atomic
    def execute(*, village: Village, **fields: Any) -> Village:
        locked_village = (
            Village.objects.select_for_update().filter(pk=village.pk).first()
        )
        if locked_village is None:
            raise VillageNotFound()

        new_name = fields.get("name")
        new_district = fields.get("district")
        target_name = new_name if new_name is not None else locked_village.name
        target_district = (
            new_district if new_district is not None else locked_village.district
        )

        if (
            Village.objects.filter(name=target_name, district=target_district)
            .exclude(pk=locked_village.pk)
            .exists()
        ):
            raise DuplicateVillageError()

        update_fields: list[str] = []
        for field in UpdateVillageService.UPDATABLE_FIELDS:
            if field in fields and fields[field] is not None:
                setattr(locked_village, field, fields[field])
                update_fields.append(field)

        if update_fields:
            update_fields.append("updated_at")
            try:
                locked_village.save(update_fields=update_fields)
            except IntegrityError as exc:
                raise DuplicateVillageError() from exc

        return locked_village
