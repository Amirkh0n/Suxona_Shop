from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAdmin, IsAuthenticatedUser
from apps.common.schema import DetailSerializer
from apps.stores.selectors import StoreApplicationSelector
from apps.stores.serializers import (
    StoreApplicationCreateSerializer,
    StoreApplicationDetailSerializer,
    StoreApplicationListSerializer,
    StoreApplicationRejectSerializer,
)
from apps.stores.services import (
    ApproveStoreService,
    CreateStoreApplicationService,
    RejectStoreService,
)
from apps.stores.views.base import PaginatedAPIView


@extend_schema(tags=["Stores"])
class StoreApplicationCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(
        summary="Apply to open a store",
        request=StoreApplicationCreateSerializer,
        responses={
            201: StoreApplicationDetailSerializer,
            400: OpenApiResponse(DetailSerializer, "Validation or service error."),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = StoreApplicationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            application = CreateStoreApplicationService.execute(
                owner=request.user,
                **serializer.validated_data,
            )
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            StoreApplicationDetailSerializer(application).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Admin"])
class PendingStoreApplicationListView(PaginatedAPIView):
    permission_classes = [IsAdmin]

    @extend_schema(
        operation_id="admin_store_applications_list",
        summary="List pending store applications (admin)",
        responses={200: StoreApplicationListSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        applications = StoreApplicationSelector.get_pending_applications()
        return self.paginate(
            applications,
            StoreApplicationListSerializer,
            request,
        )


@extend_schema(tags=["Admin"])
class ApproveStoreApplicationView(APIView):
    permission_classes = [IsAdmin]

    @extend_schema(
        summary="Approve a store application (admin)",
        request=None,
        responses={
            200: StoreApplicationDetailSerializer,
            400: OpenApiResponse(DetailSerializer, "Service error."),
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
    )
    def post(self, request: Request, application_id: int) -> Response:
        application = StoreApplicationSelector.get_application_by_id(application_id)
        if application is None:
            return Response(
                {"detail": "Store application not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            ApproveStoreService.execute(application=application)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        refreshed = StoreApplicationSelector.get_application_by_id(application_id)
        return Response(
            StoreApplicationDetailSerializer(refreshed).data,
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Admin"])
class RejectStoreApplicationView(APIView):
    permission_classes = [IsAdmin]

    @extend_schema(
        summary="Reject a store application (admin)",
        request=StoreApplicationRejectSerializer,
        responses={
            200: StoreApplicationDetailSerializer,
            400: OpenApiResponse(DetailSerializer, "Service error."),
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
    )
    def post(self, request: Request, application_id: int) -> Response:
        application = StoreApplicationSelector.get_application_by_id(application_id)
        if application is None:
            return Response(
                {"detail": "Store application not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = StoreApplicationRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            application = RejectStoreService.execute(
                application=application,
                **serializer.validated_data,
            )
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            StoreApplicationDetailSerializer(application).data,
            status=status.HTTP_200_OK,
        )
