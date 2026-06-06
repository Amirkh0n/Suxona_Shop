from django.db.models import QuerySet

from apps.common.enums import StoreApplicationStatus
from apps.stores.models import StoreApplication


class StoreApplicationSelector:
    @staticmethod
    def get_application_by_id(application_id) -> StoreApplication | None:
        return (
            StoreApplication.objects.filter(pk=application_id)
            .select_related("owner")
            .first()
        )

    @staticmethod
    def get_pending_application(application_id) -> StoreApplication | None:
        return (
            StoreApplication.objects.filter(
                pk=application_id,
                status=StoreApplicationStatus.PENDING,
            )
            .select_related("owner")
            .first()
        )

    @staticmethod
    def get_user_pending_application(user_id) -> StoreApplication | None:
        return (
            StoreApplication.objects.filter(
                owner_id=user_id,
                status=StoreApplicationStatus.PENDING,
            )
            .select_related("owner")
            .first()
        )

    @staticmethod
    def get_pending_applications() -> QuerySet[StoreApplication]:
        return (
            StoreApplication.objects.filter(
                status=StoreApplicationStatus.PENDING,
            )
            .select_related("owner")
            .order_by("created_at")
        )
