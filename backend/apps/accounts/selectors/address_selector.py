from django.db.models import QuerySet

from apps.accounts.models import Address


class AddressSelector:
    @staticmethod
    def get_user_addresses(user_id) -> QuerySet[Address]:
        return (
            Address.objects.filter(user_id=user_id)
            .select_related("village")
            .order_by("-is_default", "-created_at")
        )

    @staticmethod
    def get_default_address(user_id) -> Address | None:
        return (
            Address.objects.filter(user_id=user_id, is_default=True)
            .select_related("village")
            .first()
        )

    @staticmethod
    def get_address_by_id(address_id) -> Address | None:
        return (
            Address.objects.filter(pk=address_id)
            .select_related("village")
            .first()
        )

    @staticmethod
    def get_user_address(user_id, address_id) -> Address | None:
        return (
            Address.objects.filter(pk=address_id, user_id=user_id)
            .select_related("village")
            .first()
        )
