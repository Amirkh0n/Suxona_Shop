from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.selectors import AddressSelector
from apps.accounts.serializers import (
    AddressCreateSerializer,
    AddressDetailSerializer,
    AddressListSerializer,
    AddressUpdateSerializer,
)
from apps.accounts.services import (
    CreateAddressService,
    DeleteAddressService,
    UpdateAddressService,
)
from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAuthenticatedUser


class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request: Request) -> Response:
        addresses = AddressSelector.get_user_addresses(request.user.id)
        return Response(
            AddressListSerializer(addresses, many=True).data,
            status=status.HTTP_200_OK,
        )

    def post(self, request: Request) -> Response:
        serializer = AddressCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            address = CreateAddressService.execute(
                user=request.user,
                **serializer.validated_data,
            )
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            AddressDetailSerializer(address).data,
            status=status.HTTP_201_CREATED,
        )


class AddressDetailView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def _get_object_or_none(self, request: Request, address_id: int):
        return AddressSelector.get_user_address(request.user.id, address_id)

    def get(self, request: Request, address_id: int) -> Response:
        address = self._get_object_or_none(request, address_id)
        if address is None:
            return Response(
                {"detail": "Address not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            AddressDetailSerializer(address).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request: Request, address_id: int) -> Response:
        address = self._get_object_or_none(request, address_id)
        if address is None:
            return Response(
                {"detail": "Address not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AddressUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            address = UpdateAddressService.execute(
                address=address,
                **serializer.validated_data,
            )
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            AddressDetailSerializer(address).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request: Request, address_id: int) -> Response:
        address = self._get_object_or_none(request, address_id)
        if address is None:
            return Response(
                {"detail": "Address not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        DeleteAddressService.execute(address=address)
        return Response(status=status.HTTP_204_NO_CONTENT)
