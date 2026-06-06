from typing import Any

from django.db import transaction

from apps.banners.exceptions import InvalidSortOrderError
from apps.banners.models import Banner


class CreateBannerService:
    """Create a banner (admin-managed entity).

    Business rules:
    - sort_order must be >= 0.
    """

    @staticmethod
    @transaction.atomic
    def execute(
        *,
        title: str,
        image: Any,
        url: str = "",
        is_active: bool = True,
        sort_order: int = 0,
    ) -> Banner:
        if sort_order < 0:
            raise InvalidSortOrderError()

        return Banner.objects.create(
            title=title,
            image=image,
            url=url,
            is_active=is_active,
            sort_order=sort_order,
        )
