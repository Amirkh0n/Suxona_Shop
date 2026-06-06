from django.db.models import QuerySet

from apps.products.models import ProductImage


class ProductImageSelector:
    @staticmethod
    def get_product_image_by_id(image_id) -> ProductImage | None:
        return (
            ProductImage.objects.filter(pk=image_id)
            .select_related("product", "product__store")
            .first()
        )

    @staticmethod
    def get_product_images(product_id) -> QuerySet[ProductImage]:
        return (
            ProductImage.objects.filter(product_id=product_id)
            .order_by("sort_order")
        )

    @staticmethod
    def get_primary_image(product_id) -> ProductImage | None:
        return ProductImage.objects.filter(
            product_id=product_id,
            is_primary=True,
        ).first()
