from decimal import Decimal

from django.db import IntegrityError, transaction

from apps.accounts.models import User
from apps.stores.exceptions import (
    DuplicateDeliveryZoneError,
    InvalidDeliveryPriceError,
    NotStoreOwnerError,
    StoreNotFound,
    VillageNotFound,
)
from apps.stores.models import DeliveryZone, Store, Village


class CreateDeliveryZoneService:
    """Create a delivery zone for a store.

    Business rules:
    - Only the store owner may create zones for their store.
    - A store may have only one delivery zone per village.
    - delivery_price must be >= 0.
    """

    @staticmethod
    @transaction.atomic
    def execute(
        *,
        store: Store,
        actor: User,
        village_id: int,
        delivery_price: Decimal,
        is_active: bool = True,
    ) -> DeliveryZone:
        locked_store = (
            Store.objects.select_for_update().filter(pk=store.pk).first()
        )
        if locked_store is None:
            raise StoreNotFound()

        if locked_store.owner_id != actor.pk:
            raise NotStoreOwnerError()

        if delivery_price < 0:
            raise InvalidDeliveryPriceError()

        if not Village.objects.filter(pk=village_id).exists():
            raise VillageNotFound()

        if DeliveryZone.objects.filter(
            store=locked_store,
            village_id=village_id,
        ).exists():
            raise DuplicateDeliveryZoneError()

        try:
            return DeliveryZone.objects.create(
                store=locked_store,
                village_id=village_id,
                delivery_price=delivery_price,
                is_active=is_active,
            )
        except IntegrityError as exc:
            # Guards the unique_store_village_delivery_zone constraint against
            # a concurrent create for the same store/village pair.
            raise DuplicateDeliveryZoneError() from exc
