from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import ServiceError
from apps.common.permissions import IsStoreOwner
from apps.common.schema import DetailSerializer
from apps.products.exceptions import (
    InvalidImageOrderError,
    MaxImagesError,
    MinImagesError,
    NotProductOwnerError,
    ProductImageNotFound,
    ProductNotFound,
)
from apps.products.selectors import ProductImageSelector, ProductSelector
from apps.products.serializers import (
    ProductImageReorderSerializer,
    ProductImageSerializer,
    ProductImageUploadSerializer,
)
from apps.products.services import (
    DeleteProductImageService,
    ReorderProductImagesService,
    UploadProductImageService,
)


@extend_schema(tags=["Products"])
class ProductImageListUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsStoreOwner()]
        return [AllowAny()]

    @extend_schema(
        summary="List a product's images",
        responses={
            200: ProductImageSerializer(many=True),
            404: OpenApiResponse(DetailSerializer, "Product not found."),
        },
    )
    def get(self, request: Request, product_id: int) -> Response:
        product = ProductSelector.get_product_by_id(product_id)
        if product is None:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        images = ProductImageSelector.get_product_images(product_id)
        return Response(
            ProductImageSerializer(images, many=True).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Upload a product image (store owner)",
        request=ProductImageUploadSerializer,
        responses={
            201: ProductImageSerializer,
            400: OpenApiResponse(DetailSerializer, "Validation or max images."),
            403: OpenApiResponse(DetailSerializer, "Not the product owner."),
            404: OpenApiResponse(DetailSerializer, "Product not found."),
        },
    )
    def post(self, request: Request, product_id: int) -> Response:
        product = ProductSelector.get_product_by_id(product_id)
        if product is None:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        self.check_object_permissions(request, product)

        serializer = ProductImageUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            image = UploadProductImageService.execute(
                product=product,
                actor=request.user,
                **serializer.validated_data,
            )
        except ProductNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except NotProductOwnerError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except MaxImagesError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            ProductImageSerializer(image).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Products"])
class ProductImageReorderView(APIView):
    permission_classes = [IsStoreOwner]

    @extend_schema(
        summary="Reorder product images (store owner)",
        request=ProductImageReorderSerializer,
        responses={
            200: ProductImageSerializer(many=True),
            400: OpenApiResponse(DetailSerializer, "Invalid image order."),
            403: OpenApiResponse(DetailSerializer, "Not the product owner."),
            404: OpenApiResponse(DetailSerializer, "Product not found."),
        },
    )
    def post(self, request: Request, product_id: int) -> Response:
        product = ProductSelector.get_product_by_id(product_id)
        if product is None:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        self.check_object_permissions(request, product)

        serializer = ProductImageReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            images = ReorderProductImagesService.execute(
                product=product,
                actor=request.user,
                image_ids=serializer.validated_data["images"],
            )
        except ProductNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except NotProductOwnerError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except InvalidImageOrderError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            ProductImageSerializer(images, many=True).data,
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Products"])
class ProductImageDeleteView(APIView):
    permission_classes = [IsStoreOwner]

    @extend_schema(
        summary="Delete a product image (store owner)",
        responses={
            204: OpenApiResponse(description="Deleted."),
            400: OpenApiResponse(DetailSerializer, "Cannot delete last image."),
            403: OpenApiResponse(DetailSerializer, "Not the product owner."),
            404: OpenApiResponse(DetailSerializer, "Image not found."),
        },
    )
    def delete(self, request: Request, image_id: int) -> Response:
        image = ProductImageSelector.get_product_image_by_id(image_id)
        if image is None:
            return Response(
                {"detail": "Product image not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        # Enforce object-level ownership through the permission layer using the
        # parent product (IsStoreOwner resolves the owner via product.store_id).
        # The service re-checks ownership as a defense-in-depth safeguard.
        self.check_object_permissions(request, image.product)

        try:
            DeleteProductImageService.execute(image=image, actor=request.user)
        except ProductImageNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except NotProductOwnerError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except MinImagesError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)
