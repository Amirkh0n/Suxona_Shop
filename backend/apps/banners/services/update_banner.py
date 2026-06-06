from typing import Any

from django.db import transaction

from apps.banners.exceptions import BannerNotFound, InvalidSortOrderError
from apps.banners.models import Banner


class UpdateBannerService:
    """Update a banner (admin-managed entity).

    Business rules:
    - Partial updates supported.
    - sort_order, when provided, must be >= 0.
    """

    UPDATABLE_FIELDS = ("title", "image", "url", "is_active", "sort_order")

    @staticmethod
    @transaction.atomic
    def execute(*, banner: Banner, **fields: Any) -> Banner:
        locked = Banner.objects.select_for_update().filter(pk=banner.pk).first()
        if locked is None:
            raise BannerNotFound()

        if "sort_order" in fields and fields["sort_order"] is not None:
            if fields["sort_order"] < 0:
                raise InvalidSortOrderError()

        update_fields: list[str] = []
        for field in UpdateBannerService.UPDATABLE_FIELDS:
            if field in fields and fields[field] is not None:
                setattr(locked, field, fields[field])
                update_fields.append(field)

        if update_fields:
            update_fields.append("updated_at")
            locked.save(update_fields=update_fields)

        return locked
