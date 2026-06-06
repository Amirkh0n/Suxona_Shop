from django.db.models import QuerySet

from apps.banners.models import Banner


class BannerSelector:
    @staticmethod
    def get_active_banners() -> QuerySet[Banner]:
        return Banner.objects.filter(is_active=True).order_by("sort_order")

    @staticmethod
    def get_banner_by_id(banner_id) -> Banner | None:
        return Banner.objects.filter(pk=banner_id).first()
