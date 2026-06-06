from decimal import Decimal
from typing import Any

from django.db import transaction

from apps.accounts.models import User
from apps.stores.exceptions import (
    DeliveryZoneNotFound,
    InvalidDeliveryPriceError,
    NotStoreOwnerError,
)
from apps.stores.models import DeliveryZone


class UpdateDeliveryZoneService:
    """Update a delivery zone.

    Business rules:
    - Only the owner of the zone's store may update it.
    - delivery_price must be >= 0.
    - The (store, village) pairing is immutable here; only price and the
      active flag may change.
    """

    @staticmethod
    @transaction.atomic
    def execute(*, zone: DeliveryZone, actor: User, **fields: Any) -> DeliveryZone:
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

        update_fields: list[str] = []

        delivery_price = fields.get("delivery_price")
        if delivery_price is not None:
            if Decimal(delivery_price) < 0:
                raise InvalidDeliveryPriceError()
            locked_zone.delivery_price = delivery_price
            update_fields.append("delivery_price")

        is_active = fields.get("is_active")
        if is_active is not None:
            locked_zone.is_active = is_active
            update_fields.append("is_active")

        if update_fields:
            update_fields.append("updated_at")
            locked_zone.save(update_fields=update_fields)

        return locked_zone
