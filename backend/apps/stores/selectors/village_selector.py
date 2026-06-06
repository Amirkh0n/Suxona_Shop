from django.db.models import QuerySet

from apps.stores.models import Village


class VillageSelector:
    @staticmethod
    def get_village_by_id(village_id) -> Village | None:
        return Village.objects.filter(pk=village_id).first()

    @staticmethod
    def get_active_villages() -> QuerySet[Village]:
        return Village.objects.filter(is_active=True).order_by("district", "name")
