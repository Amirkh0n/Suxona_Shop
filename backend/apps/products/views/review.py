from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from apps.common.enums import ProductStatus
from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAuthenticatedUser
from apps.common.schema import DetailSerializer
from apps.products.exceptions import ProductNotFound, ProductReviewAlreadyExistsError
from apps.products.models import Product, ProductReview
from apps.products.serializers import ProductReviewCreateSerializer, ProductReviewSerializer
from apps.products.services import CreateProductReviewService
from apps.products.views.base import PaginatedAPIView

PUBLIC = (ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK)


@extend_schema(tags=["Products"])
class ProductReviewListCreateView(PaginatedAPIView):
    def get_permissions(self):
        return [IsAuthenticatedUser()] if self.request.method == "POST" else [AllowAny()]

    @extend_schema(
        operation_id="product_reviews_list",
        summary="List a product's reviews",
        responses={200: ProductReviewSerializer(many=True)},
    )
    def get(self, request: Request, product_id: int) -> Response:
        if not Product.objects.filter(pk=product_id, status__in=PUBLIC).exists():
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        reviews = ProductReview.objects.filter(
            product_id=product_id, is_hidden=False
        ).select_related("customer")
        return self.paginate(reviews, ProductReviewSerializer, request)

    @extend_schema(
        summary="Review a product you bought (once)",
        request=ProductReviewCreateSerializer,
        responses={
            201: ProductReviewSerializer,
            400: OpenApiResponse(DetailSerializer, "Not a buyer."),
            404: OpenApiResponse(DetailSerializer, "Not found."),
            409: OpenApiResponse(DetailSerializer, "Already reviewed."),
        },
    )
    def post(self, request: Request, product_id: int) -> Response:
        serializer = ProductReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            review = CreateProductReviewService.execute(
                product_id=product_id, customer=request.user, **serializer.validated_data
            )
        except ProductNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except ProductReviewAlreadyExistsError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ProductReviewSerializer(review).data, status=status.HTTP_201_CREATED)
