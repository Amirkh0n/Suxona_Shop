from django.db import transaction

from apps.accounts.models import User
from apps.stores.exceptions import DeliveryZoneNotFound, NotStoreOwnerError
from apps.stores.models import DeliveryZone


class DeleteDeliveryZoneService:
    """Delete a delivery zone.

    Business rules:
    - Only the owner of the zone's store may delete it.
    """

    @staticmethod
    @transaction.atomic
    def execute(*, zone: DeliveryZone, actor: User) -> None:
        locked_zone = (
            DeliveryZone.objects.select_for_update()
            .select_related("store")
            .filter(pk=zone.pk)
            .first()
        )
        if locked_zone is None:
            raise DeliveryZoneNotFound()

        if locked_zone.store.owner_id != actor.pk:
            raise NotStoreOwnerError()

        locked_zone.delete()
