from django.db import transaction
from django.db.models import ProtectedError

from apps.stores.exceptions import VillageInUseError, VillageNotFound
from apps.stores.models import Village


class DeleteVillageService:
    """Delete a village (admin-managed entity).

    Business rules:
    - A village referenced by delivery zones or addresses (PROTECT relations)
      cannot be deleted; this surfaces as a soft business error.
    """

    @staticmethod
    @transaction.atomic
    def execute(*, village: Village) -> None:
        locked_village = (
            Village.objects.select_for_update().filter(pk=village.pk).first()
        )
        if locked_village is None:
            raise VillageNotFound()

        try:
            locked_village.delete()
        except ProtectedError as exc:
            raise VillageInUseError() from exc
