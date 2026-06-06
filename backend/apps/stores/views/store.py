from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsSeller
from apps.stores.exceptions import NotStoreOwnerError, StoreNotFound
from apps.common.exceptions import ServiceError
from apps.common.schema import DetailSerializer
from apps.stores.selectors import StoreSelector
from apps.stores.serializers import (
    StoreDetailSerializer,
    StoreListSerializer,
    StoreUpdateSerializer,
)
from apps.stores.services import UpdateStoreService
from apps.stores.views.base import PaginatedAPIView


@extend_schema(tags=["Stores"])
class StoreListView(PaginatedAPIView):
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="stores_list",
        summary="List active stores",
        parameters=[
            OpenApiParameter("search", str, description="Search by store name."),
        ],
        responses={200: StoreListSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        search = request.query_params.get("search")
        if search:
            stores = StoreSelector.search_stores(search)
        else:
            stores = StoreSelector.get_active_stores()
        return self.paginate(stores, StoreListSerializer, request)


@extend_schema(tags=["Stores"])
class StoreDetailView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="stores_retrieve",
        summary="Get a store",
        responses={
            200: StoreDetailSerializer,
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
    )
    def get(self, request: Request, store_id: int) -> Response:
        store = StoreSelector.get_store_by_id(store_id)
        if store is None:
            return Response(
                {"detail": "Store not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            StoreDetailSerializer(store).data,
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Stores"])
class MyStoreView(APIView):
    permission_classes = [IsSeller]

    @extend_schema(
        summary="Get my store",
        responses={
            200: StoreDetailSerializer,
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
    )
    def get(self, request: Request) -> Response:
        store = StoreSelector.get_store_by_owner(request.user.id)
        if store is None:
            return Response(
                {"detail": "Store not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            StoreDetailSerializer(store).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Update my store",
        request=StoreUpdateSerializer,
        responses={
            200: StoreDetailSerializer,
            400: OpenApiResponse(DetailSerializer, "Validation or service error."),
            403: OpenApiResponse(DetailSerializer, "Not the store owner."),
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
    )
    def patch(self, request: Request) -> Response:
        store = StoreSelector.get_store_by_owner(request.user.id)
        if store is None:
            return Response(
                {"detail": "Store not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = StoreUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            store = UpdateStoreService.execute(
                store=store,
                actor=request.user,
                **serializer.validated_data,
            )
        except StoreNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except NotStoreOwnerError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            StoreDetailSerializer(store).data,
            status=status.HTTP_200_OK,
        )
