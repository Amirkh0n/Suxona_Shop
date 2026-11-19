from decimal import Decimal, InvalidOperation

from django.db.models import (
    Case,
    DecimalField,
    F,
    IntegerField,
    Prefetch,
    Q,
    QuerySet,
    Sum,
    Value,
    When,
)
from django.db.models.functions import Coalesce

from apps.common.enums import ProductStatus
from apps.products.models import Product, ProductVariant

VARIANT_PREFETCH = Prefetch(
    "variants",
    queryset=ProductVariant.objects.select_related("product"),
)


ORDERINGS = {
    "new": ("-created_at",),
    "price_asc": ("price", "-created_at"),
    "price_desc": ("-price", "-created_at"),
    "popular": ("-sold", "-created_at"),
    "discount": ("-discount_pct", "-created_at"),
    "rating": ("-rating_avg", "-rating_count", "-created_at"),
}


def _decimal(value):
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


class ProductSelector:
    @staticmethod
    def filter_public_products(
        *,
        search: str = "",
        category_ids: list[int] | None = None,
        store_id=None,
        on_sale: bool = False,
        in_stock: bool = False,
        min_price=None,
        max_price=None,
        ordering: str = "new",
    ) -> QuerySet[Product]:
        """One entry point for every public product listing (search, filters, sorting).

        Search is multi-word: every word must appear in the name or description,
        and name hits rank above description-only hits.
        """
        qs = Product.objects.filter(status=ProductStatus.ACTIVE)
        if store_id:
            qs = qs.filter(store_id=store_id)
        if category_ids:
            qs = qs.filter(category_id__in=category_ids)
        if on_sale:
            qs = qs.filter(old_price__isnull=False, old_price__gt=F("price"))
        if in_stock:
            qs = qs.filter(Q(stock__isnull=True) | Q(stock__gt=0))
        low, high = _decimal(min_price), _decimal(max_price)
        if low is not None:
            qs = qs.filter(price__gte=low)
        if high is not None:
            qs = qs.filter(price__lte=high)

        words = [w for w in search.split() if w][:6]
        rank_cases = []
        for word in words:
            qs = qs.filter(Q(name__icontains=word) | Q(description__icontains=word))
            rank_cases.append(When(name__icontains=word, then=Value(1)))
        order = list(ORDERINGS.get(ordering, ORDERINGS["new"]))
        if words:
            rank = sum(
                (Case(c, default=Value(0), output_field=IntegerField()) for c in rank_cases),
                Value(0),
            )
            qs = qs.annotate(name_rank=rank)
            if ordering in ("new", ""):
                order = ["-name_rank", *order]
        if "-sold" in order:
            qs = qs.annotate(
                sold=Coalesce(
                    Sum(
                        "order_items__quantity",
                        filter=~Q(order_items__order__status__in=["CANCELLED", "REJECTED"]),
                    ),
                    Value(0),
                )
            )
        if "-discount_pct" in order:
            qs = qs.annotate(
                discount_pct=Case(
                    When(
                        old_price__gt=F("price"),
                        then=(F("old_price") - F("price")) * 100 / F("old_price"),
                    ),
                    default=Value(Decimal("0")),
                    output_field=DecimalField(max_digits=12, decimal_places=4),
                )
            )
        return (
            qs.select_related("store", "category")
            .prefetch_related("images", VARIANT_PREFETCH)
            .order_by(*order)
        )

    @staticmethod
    def get_similar_products(product: Product, limit: int = 8) -> QuerySet[Product]:
        """Same category first (excluding the product itself), newest first."""
        return (
            Product.objects.filter(category_id=product.category_id, status=ProductStatus.ACTIVE)
            .exclude(pk=product.pk)
            .select_related("store", "category")
            .prefetch_related("images", VARIANT_PREFETCH)
            .order_by("-created_at")[:limit]
        )
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
    def get_favorite_products(user_id) -> QuerySet[Product]:
        return (
            Product.objects.filter(
                favorites__user_id=user_id,
                status__in=(ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK),
            )
            .select_related("store", "category")
            .prefetch_related("images", VARIANT_PREFETCH)
            .order_by("-favorites__created_at")
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
    def get_public_store_products(store_id) -> QuerySet[Product]:
        """What shoppers see on a store page: live (ACTIVE) products only."""
        return (
            Product.objects.filter(store_id=store_id, status=ProductStatus.ACTIVE)
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
