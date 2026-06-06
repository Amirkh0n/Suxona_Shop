from drf_spectacular.utils import OpenApiResponse, extend_schema
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
from apps.common.schema import DetailSerializer


@extend_schema(tags=["Users"])
class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(
        summary="List my addresses",
        responses={200: AddressListSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        addresses = AddressSelector.get_user_addresses(request.user.id)
        return Response(
            AddressListSerializer(addresses, many=True).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Create an address",
        request=AddressCreateSerializer,
        responses={
            201: AddressDetailSerializer,
            400: OpenApiResponse(DetailSerializer, "Validation or service error."),
        },
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


@extend_schema(tags=["Users"])
class AddressDetailView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def _get_object_or_none(self, request: Request, address_id: int):
        return AddressSelector.get_user_address(request.user.id, address_id)

    @extend_schema(
        summary="Get an address",
        responses={
            200: AddressDetailSerializer,
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
    )
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

    @extend_schema(
        summary="Update an address",
        request=AddressUpdateSerializer,
        responses={
            200: AddressDetailSerializer,
            400: OpenApiResponse(DetailSerializer, "Validation or service error."),
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
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

    @extend_schema(
        summary="Delete an address",
        responses={
            204: OpenApiResponse(description="Deleted."),
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
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
