from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import ServiceError
from apps.common.permissions import IsStoreOwner
from apps.common.schema import DetailSerializer
from apps.products.exceptions import (
    DuplicateProductVariantError,
    NotProductOwnerError,
    ProductNotFound,
    ProductVariantNotFound,
)
from apps.products.models import ProductVariant
from apps.products.selectors import ProductSelector
from apps.products.serializers import (
    ProductVariantCreateSerializer,
    ProductVariantSerializer,
    ProductVariantUpdateSerializer,
)
from apps.products.services import (
    CreateProductVariantService,
    DeleteProductVariantService,
    UpdateProductVariantService,
)


@extend_schema(tags=["Product variants"])
class ProductVariantListCreateView(APIView):
    permission_classes = [IsStoreOwner]

    @extend_schema(
        summary="Create a product variant",
        request=ProductVariantCreateSerializer,
        responses={201: ProductVariantSerializer},
    )
    def post(self, request: Request, product_id: int) -> Response:
        product = ProductSelector.get_product_by_id(product_id)
        if product is None:
            return Response({"detail": "Product not found."}, status=404)
        self.check_object_permissions(request, product)

        serializer = ProductVariantCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            variant = CreateProductVariantService.execute(
                product=product,
                actor=request.user,
                **serializer.validated_data,
            )
        except ProductNotFound as exc:
            return Response({"detail": str(exc)}, status=404)
        except NotProductOwnerError as exc:
            return Response({"detail": str(exc)}, status=403)
        except DuplicateProductVariantError as exc:
            return Response({"detail": str(exc)}, status=400)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=400)
        return Response(ProductVariantSerializer(variant).data, status=201)


@extend_schema(tags=["Product variants"])
class ProductVariantDetailView(APIView):
    permission_classes = [IsStoreOwner]

    def _get_variant(self, variant_id: int):
        return (
            ProductVariant.objects.select_related("product__store")
            .filter(pk=variant_id)
            .first()
        )

    @extend_schema(
        summary="Update a product variant",
        request=ProductVariantUpdateSerializer,
        responses={200: ProductVariantSerializer},
    )
    def patch(self, request: Request, variant_id: int) -> Response:
        variant = self._get_variant(variant_id)
        if variant is None:
            return Response({"detail": "Product variant not found."}, status=404)
        self.check_object_permissions(request, variant.product)

        serializer = ProductVariantUpdateSerializer(
            variant,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        try:
            variant = UpdateProductVariantService.execute(
                variant=variant,
                actor=request.user,
                **serializer.validated_data,
            )
        except ProductVariantNotFound as exc:
            return Response({"detail": str(exc)}, status=404)
        except NotProductOwnerError as exc:
            return Response({"detail": str(exc)}, status=403)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=400)
        return Response(ProductVariantSerializer(variant).data)

    @extend_schema(
        summary="Delete a product variant",
        responses={204: OpenApiResponse(description="Deleted.")},
    )
    def delete(self, request: Request, variant_id: int) -> Response:
        variant = self._get_variant(variant_id)
        if variant is None:
            return Response({"detail": "Product variant not found."}, status=404)
        self.check_object_permissions(request, variant.product)
        try:
            DeleteProductVariantService.execute(
                variant=variant,
                actor=request.user,
            )
        except ProductVariantNotFound as exc:
            return Response({"detail": str(exc)}, status=404)
        except NotProductOwnerError as exc:
            return Response({"detail": str(exc)}, status=403)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=400)
        return Response(status=status.HTTP_204_NO_CONTENT)
