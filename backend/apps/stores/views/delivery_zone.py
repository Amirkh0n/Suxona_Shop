from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import ServiceError
from apps.common.permissions import IsSeller, IsAuthenticatedUser
from apps.stores.exceptions import (
    DeliveryZoneNotFound,
    NotStoreOwnerError,
    StoreNotFound,
)
from apps.stores.models import DeliveryZone
from apps.stores.selectors import DeliveryZoneSelector, StoreSelector
from apps.stores.serializers import (
    DeliveryZoneCreateSerializer,
    DeliveryZoneListSerializer,
    DeliveryZoneUpdateSerializer,
)
from apps.stores.services import (
    CreateDeliveryZoneService,
    DeleteDeliveryZoneService,
    UpdateDeliveryZoneService,
)


class StoreDeliveryZoneListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, store_id: int) -> Response:
        if not StoreSelector.store_exists(store_id):
            return Response(
                {"detail": "Store not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        zones = DeliveryZoneSelector.get_store_delivery_zones(store_id)
        return Response(
            DeliveryZoneListSerializer(zones, many=True).data,
            status=status.HTTP_200_OK,
        )


class DeliveryZoneCreateView(APIView):
    permission_classes = [IsSeller]

    def post(self, request: Request) -> Response:
        store = getattr(request, "seller_store", None) or (
            StoreSelector.get_store_by_owner(request.user.id)
        )
        if store is None:
            return Response(
                {"detail": "Store not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DeliveryZoneCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            zone = CreateDeliveryZoneService.execute(
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
            DeliveryZoneListSerializer(zone).data,
            status=status.HTTP_201_CREATED,
        )


class DeliveryZoneDetailView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def _get_zone_or_none(self, zone_id: int) -> DeliveryZone | None:
        return DeliveryZoneSelector.get_delivery_zone_by_id(zone_id)

    def patch(self, request: Request, zone_id: int) -> Response:
        zone = self._get_zone_or_none(zone_id)
        if zone is None:
            return Response(
                {"detail": "Delivery zone not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DeliveryZoneUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            zone = UpdateDeliveryZoneService.execute(
                zone=zone,
                actor=request.user,
                **serializer.validated_data,
            )
        except DeliveryZoneNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except NotStoreOwnerError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            DeliveryZoneListSerializer(zone).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request: Request, zone_id: int) -> Response:
        zone = self._get_zone_or_none(zone_id)
        if zone is None:
            return Response(
                {"detail": "Delivery zone not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            DeleteDeliveryZoneService.execute(zone=zone, actor=request.user)
        except DeliveryZoneNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except NotStoreOwnerError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)
