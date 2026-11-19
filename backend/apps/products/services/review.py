from django.db import transaction
from django.db.models import Avg, Count

from apps.accounts.models import User
from apps.common.enums import OrderStatus
from apps.products.exceptions import (
    ProductNotFound,
    ProductReviewAlreadyExistsError,
    ProductReviewNotAllowedError,
)
from apps.products.models import Product, ProductReview


def refresh_product_rating(product_id: int) -> None:
    """Recompute the cached average from visible reviews."""
    agg = ProductReview.objects.filter(product_id=product_id, is_hidden=False).aggregate(
        avg=Avg("rating"), n=Count("id")
    )
    Product.objects.filter(pk=product_id).update(
        rating_avg=round(agg["avg"] or 0, 2), rating_count=agg["n"]
    )


class CreateProductReviewService:
    @staticmethod
    @transaction.atomic
    def execute(
        *, product_id: int, customer: User, rating: int, comment: str = ""
    ) -> ProductReview:
        from apps.orders.models import OrderItem

        product = Product.objects.select_for_update().filter(pk=product_id).first()
        if product is None:
            raise ProductNotFound()
        bought = OrderItem.objects.filter(
            product_id=product_id, order__customer=customer, order__status=OrderStatus.COMPLETED
        ).exists()
        if not bought:
            raise ProductReviewNotAllowedError()
        if ProductReview.objects.filter(product=product, customer=customer).exists():
            raise ProductReviewAlreadyExistsError()
        review = ProductReview.objects.create(
            product=product, customer=customer, rating=rating, comment=comment
        )
        refresh_product_rating(product_id)
        return review
