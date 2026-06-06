from django.db import IntegrityError, transaction

from apps.stores.exceptions import DuplicateVillageError
from apps.stores.models import Village


class CreateVillageService:
    """Create a village (admin-managed entity).

    Business rules:
    - (name, district) must be unique.
    - Soft business validation only; respects the is_active flag.
    """

    @staticmethod
    @transaction.atomic
    def execute(
        *,
        name: str,
        district: str,
        is_active: bool = True,
    ) -> Village:
        if Village.objects.filter(name=name, district=district).exists():
            raise DuplicateVillageError()

        try:
            return Village.objects.create(
                name=name,
                district=district,
                is_active=is_active,
            )
        except IntegrityError as exc:
            # Guards the unique_village_name_district constraint against a
            # concurrent create for the same name/district pair.
            raise DuplicateVillageError() from exc
