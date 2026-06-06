from django.db import transaction

from apps.accounts.models import Address


class DeleteAddressService:
    @staticmethod
    @transaction.atomic
    def execute(*, address: Address) -> None:
        address.delete()
