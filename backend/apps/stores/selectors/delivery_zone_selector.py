from django.db.models import QuerySet

from apps.stores.models import DeliveryZone


class DeliveryZoneSelector:
    @staticmethod
    def get_delivery_zone_by_id(zone_id) -> DeliveryZone | None:
        return (
            DeliveryZone.objects.filter(pk=zone_id)
            .select_related("store", "village")
            .first()
        )

    @staticmethod
    def get_delivery_zone(store_id, village_id) -> DeliveryZone | None:
        return (
            DeliveryZone.objects.filter(
                store_id=store_id,
                village_id=village_id,
                is_active=True,
            )
            .select_related("store", "village")
            .first()
        )

    @staticmethod
    def get_store_delivery_zones(store_id) -> QuerySet[DeliveryZone]:
        return (
            DeliveryZone.objects.filter(store_id=store_id, is_active=True)
            .select_related("village")
            .order_by("village__district", "village__name")
        )

    @staticmethod
    def store_delivers_to_village(store_id, village_id) -> bool:
        return DeliveryZone.objects.filter(
            store_id=store_id,
            village_id=village_id,
            is_active=True,
        ).exists()
