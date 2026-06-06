from django.db.models import QuerySet

from apps.products.models import Category


class CategorySelector:
    @staticmethod
    def get_category_by_id(category_id) -> Category | None:
        return (
            Category.objects.filter(pk=category_id)
            .select_related("parent")
            .first()
        )

    @staticmethod
    def get_active_categories() -> QuerySet[Category]:
        return (
            Category.objects.filter(is_active=True)
            .select_related("parent")
            .order_by("name")
        )

    @staticmethod
    def get_root_categories() -> QuerySet[Category]:
        return (
            Category.objects.filter(is_active=True, parent__isnull=True)
            .prefetch_related("children")
            .order_by("name")
        )
