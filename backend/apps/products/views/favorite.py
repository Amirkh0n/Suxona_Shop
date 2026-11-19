from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.enums import ProductStatus
from apps.common.permissions import IsAuthenticatedUser
from apps.common.schema import DetailSerializer
from apps.products.models import Favorite, Product
from apps.products.selectors import ProductSelector
from apps.products.serializers import ProductListSerializer
from apps.products.views.base import PaginatedAPIView


@extend_schema(tags=["Favorites"])
class FavoriteListView(PaginatedAPIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(
        summary="List my favourite products",
        responses={200: ProductListSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        products = ProductSelector.get_favorite_products(request.user.id)
        return self.paginate(products, ProductListSerializer, request)


@extend_schema(tags=["Favorites"])
class FavoriteIdsView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(summary="Ids of my favourite products (for heart icons)")
    def get(self, request: Request) -> Response:
        ids = list(
            Favorite.objects.filter(user=request.user).values_list("product_id", flat=True)
        )
        return Response({"ids": ids})


@extend_schema(tags=["Favorites"])
class FavoriteToggleView(APIView):
    """PUT adds, DELETE removes. Both are idempotent."""

    permission_classes = [IsAuthenticatedUser]

    @extend_schema(
        summary="Add a product to favourites",
        responses={204: None, 404: OpenApiResponse(DetailSerializer, "Not found.")},
    )
    def put(self, request: Request, product_id: int) -> Response:
        exists = Product.objects.filter(
            pk=product_id, status__in=(ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK)
        ).exists()
        if not exists:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        Favorite.objects.get_or_create(user=request.user, product_id=product_id)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(summary="Remove a product from favourites", responses={204: None})
    def delete(self, request: Request, product_id: int) -> Response:
        Favorite.objects.filter(user=request.user, product_id=product_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
