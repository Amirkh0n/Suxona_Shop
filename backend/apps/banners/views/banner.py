from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.banners.exceptions import BannerNotFound, InvalidSortOrderError
from apps.banners.selectors import BannerSelector
from apps.banners.serializers import (
    BannerCreateSerializer,
    BannerDetailSerializer,
    BannerListSerializer,
    BannerUpdateSerializer,
)
from apps.banners.services import (
    CreateBannerService,
    DeleteBannerService,
    UpdateBannerService,
)
from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAdmin
from apps.common.schema import DetailSerializer


@extend_schema(tags=["Banners"])
class BannerListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdmin()]
        return [AllowAny()]

    @extend_schema(
        operation_id="banners_list",
        summary="List active banners",
        responses={200: BannerListSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        banners = BannerSelector.get_active_banners()
        return Response(
            BannerListSerializer(banners, many=True).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Create a banner (admin)",
        request=BannerCreateSerializer,
        responses={
            201: BannerDetailSerializer,
            400: OpenApiResponse(DetailSerializer, "Validation or service error."),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = BannerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            banner = CreateBannerService.execute(**serializer.validated_data)
        except InvalidSortOrderError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            BannerDetailSerializer(banner).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Banners"])
class BannerDetailView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method in ("PATCH", "DELETE"):
            return [IsAdmin()]
        return [AllowAny()]

    @extend_schema(
        operation_id="banners_retrieve",
        summary="Get a banner",
        responses={
            200: BannerDetailSerializer,
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
    )
    def get(self, request: Request, banner_id: int) -> Response:
        banner = BannerSelector.get_banner_by_id(banner_id)
        if banner is None or (
            not banner.is_active and not request.user.is_staff
        ):
            return Response(
                {"detail": "Banner not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            BannerDetailSerializer(banner).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Update a banner (admin)",
        request=BannerUpdateSerializer,
        responses={
            200: BannerDetailSerializer,
            400: OpenApiResponse(DetailSerializer, "Validation or service error."),
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
    )
    def patch(self, request: Request, banner_id: int) -> Response:
        banner = BannerSelector.get_banner_by_id(banner_id)
        if banner is None:
            return Response(
                {"detail": "Banner not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = BannerUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            banner = UpdateBannerService.execute(
                banner=banner,
                **serializer.validated_data,
            )
        except BannerNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except InvalidSortOrderError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            BannerDetailSerializer(banner).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Delete a banner (admin)",
        responses={
            204: OpenApiResponse(description="Deleted."),
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
    )
    def delete(self, request: Request, banner_id: int) -> Response:
        banner = BannerSelector.get_banner_by_id(banner_id)
        if banner is None:
            return Response(
                {"detail": "Banner not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            DeleteBannerService.execute(banner=banner)
        except BannerNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)
