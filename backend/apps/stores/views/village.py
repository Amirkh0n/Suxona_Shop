from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAdmin
from apps.stores.exceptions import VillageInUseError, VillageNotFound
from apps.stores.selectors import VillageSelector
from apps.stores.serializers import (
    VillageCreateSerializer,
    VillageSerializer,
    VillageUpdateSerializer,
)
from apps.stores.services import (
    CreateVillageService,
    DeleteVillageService,
    UpdateVillageService,
)
from apps.stores.views.base import PaginatedAPIView


class VillageListView(PaginatedAPIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request: Request) -> Response:
        villages = VillageSelector.get_active_villages()
        return self.paginate(villages, VillageSerializer, request)

    def post(self, request: Request) -> Response:
        serializer = VillageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            village = CreateVillageService.execute(**serializer.validated_data)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            VillageSerializer(village).data,
            status=status.HTTP_201_CREATED,
        )


class VillageDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ("PATCH", "DELETE"):
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request: Request, village_id: int) -> Response:
        village = VillageSelector.get_village_by_id(village_id)
        if village is None:
            return Response(
                {"detail": "Village not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            VillageSerializer(village).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request: Request, village_id: int) -> Response:
        village = VillageSelector.get_village_by_id(village_id)
        if village is None:
            return Response(
                {"detail": "Village not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = VillageUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            village = UpdateVillageService.execute(
                village=village,
                **serializer.validated_data,
            )
        except VillageNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            VillageSerializer(village).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request: Request, village_id: int) -> Response:
        village = VillageSelector.get_village_by_id(village_id)
        if village is None:
            return Response(
                {"detail": "Village not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            DeleteVillageService.execute(village=village)
        except VillageInUseError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        except VillageNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)
