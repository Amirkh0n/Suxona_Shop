from django.db import transaction

from apps.banners.exceptions import BannerNotFound
from apps.banners.models import Banner


class DeleteBannerService:
    """Delete a banner (admin-managed entity)."""

    @staticmethod
    @transaction.atomic
    def execute(*, banner: Banner) -> None:
        locked = Banner.objects.select_for_update().filter(pk=banner.pk).first()
        if locked is None:
            raise BannerNotFound()

        locked.delete()
