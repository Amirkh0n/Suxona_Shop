from django.db import transaction

from apps.accounts.exceptions import VillageNotFoundError
from apps.accounts.models import Address, User
from apps.stores.models import Village


class CreateAddressService:
    @staticmethod
    @transaction.atomic
    def execute(
        *,
        user: User,
        village_id: int,
        street: str,
        house: str,
        landmark: str = "",
        is_default: bool = False,
    ) -> Address:
        if not Village.objects.filter(pk=village_id).exists():
            raise VillageNotFoundError()

        if is_default:
            Address.objects.filter(
                user=user,
                is_default=True,
            ).update(is_default=False)

        return Address.objects.create(
            user=user,
            village_id=village_id,
            street=street,
            house=house,
            landmark=landmark,
            is_default=is_default,
        )
