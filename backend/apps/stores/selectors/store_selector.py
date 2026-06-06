from django.db.models import Q, QuerySet

from apps.common.enums import StoreStatus
from apps.stores.models import Store


class StoreSelector:
    @staticmethod
    def get_store_by_id(store_id) -> Store | None:
        return (
            Store.objects.filter(pk=store_id)
            .select_related("owner")
            .first()
        )

    @staticmethod
    def get_active_store_by_id(store_id) -> Store | None:
        return (
            Store.objects.filter(pk=store_id, status=StoreStatus.ACTIVE)
            .select_related("owner")
            .first()
        )

    @staticmethod
    def get_store_by_owner(user_id) -> Store | None:
        return (
            Store.objects.filter(owner_id=user_id)
            .select_related("owner")
            .first()
        )

    @staticmethod
    def get_active_stores() -> QuerySet[Store]:
        return (
            Store.objects.filter(status=StoreStatus.ACTIVE)
            .select_related("owner")
            .order_by("name")
        )

    @staticmethod
    def search_stores(query: str) -> QuerySet[Store]:
        return (
            Store.objects.filter(
                Q(name__icontains=query),
                status=StoreStatus.ACTIVE,
            )
            .select_related("owner")
            .order_by("name")
        )

    @staticmethod
    def store_exists(store_id) -> bool:
        return Store.objects.filter(pk=store_id).exists()
