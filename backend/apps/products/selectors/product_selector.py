from django.db.models import Prefetch, Q, QuerySet

from apps.common.enums import ProductStatus
from apps.products.models import Product, ProductVariant

VARIANT_PREFETCH = Prefetch(
    "variants",
    queryset=ProductVariant.objects.select_related("product"),
)


class ProductSelector:
    @staticmethod
    def get_product_by_id(product_id) -> Product | None:
        return (
            Product.objects.filter(pk=product_id)
            .select_related("store", "category")
            .prefetch_related("images", VARIANT_PREFETCH)
            .first()
        )

    @staticmethod
    def get_active_product(product_id) -> Product | None:
        return (
            Product.objects.filter(pk=product_id, status=ProductStatus.ACTIVE)
            .select_related("store", "category")
            .prefetch_related("images", VARIANT_PREFETCH)
            .first()
        )

    @staticmethod
    def get_active_products() -> QuerySet[Product]:
        return (
            Product.objects.filter(status=ProductStatus.ACTIVE)
            .select_related("store", "category")
            .prefetch_related("images", VARIANT_PREFETCH)
            .order_by("-created_at")
        )

    @staticmethod
    def get_store_products(store_id) -> QuerySet[Product]:
        return (
            Product.objects.filter(store_id=store_id)
            .select_related("store", "category")
            .prefetch_related("images", VARIANT_PREFETCH)
            .order_by("-created_at")
        )

    @staticmethod
    def search_products(query: str) -> QuerySet[Product]:
        return (
            Product.objects.filter(
                Q(name__icontains=query) | Q(description__icontains=query),
                status=ProductStatus.ACTIVE,
            )
            .select_related("store", "category")
            .prefetch_related("images", VARIANT_PREFETCH)
            .order_by("-created_at")
        )

    @staticmethod
    def get_products_by_category(category_id) -> QuerySet[Product]:
        return (
            Product.objects.filter(
                category_id=category_id,
                status=ProductStatus.ACTIVE,
            )
            .select_related("store", "category")
            .prefetch_related("images", VARIANT_PREFETCH)
            .order_by("-created_at")
        )

    @staticmethod
    def get_products_for_checkout(store_id, product_ids) -> QuerySet[Product]:
        return (
            Product.objects.filter(
                store_id=store_id,
                pk__in=product_ids,
            )
            .select_related("store", "category")
        )
