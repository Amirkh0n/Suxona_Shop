from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsSeller
from apps.stores.exceptions import NotStoreOwnerError, StoreNotFound
from apps.common.exceptions import ServiceError
from apps.stores.selectors import StoreSelector
from apps.stores.serializers import (
    StoreDetailSerializer,
    StoreListSerializer,
    StoreUpdateSerializer,
)
from apps.stores.services import UpdateStoreService
from apps.stores.views.base import PaginatedAPIView


class StoreListView(PaginatedAPIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        search = request.query_params.get("search")
        if search:
            stores = StoreSelector.search_stores(search)
        else:
            stores = StoreSelector.get_active_stores()
        return self.paginate(stores, StoreListSerializer, request)


class StoreDetailView(APIView):
    permission_classes = [AllowAny]

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


class MyStoreView(APIView):
    permission_classes = [IsSeller]

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
