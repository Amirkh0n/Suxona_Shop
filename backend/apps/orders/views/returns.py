from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAuthenticatedUser, IsSeller
from apps.common.schema import DetailSerializer
from apps.orders.exceptions import (
    InvalidOrderStatusError,
    OrderNotFound,
    ReturnAlreadyRequestedError,
)
from apps.orders.selectors import OrderSelector
from apps.orders.serializers import (
    ReturnCreateSerializer,
    ReturnDecideSerializer,
    ReturnRequestSerializer,
)
from apps.orders.services.returns import DecideReturnService, RequestReturnService
from apps.stores.selectors import StoreSelector


@extend_schema(tags=["Orders"])
class ReturnRequestCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(
        summary="Ask to return a completed order (within 7 days)",
        request=ReturnCreateSerializer,
        responses={
            201: ReturnRequestSerializer,
            400: OpenApiResponse(DetailSerializer, "Not allowed."),
            404: OpenApiResponse(DetailSerializer, "Order not found."),
            409: OpenApiResponse(DetailSerializer, "Already requested."),
        },
    )
    def post(self, request: Request, order_id: int) -> Response:
        serializer = ReturnCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            rr = RequestReturnService.execute(
                order_id=order_id, customer=request.user, **serializer.validated_data
            )
        except OrderNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except ReturnAlreadyRequestedError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ReturnRequestSerializer(rr).data, status=status.HTTP_201_CREATED)


@extend_schema(tags=["Orders"])
class ReturnRequestDecideView(APIView):
    permission_classes = [IsSeller]

    @extend_schema(
        summary="Approve or reject a return request (seller)",
        request=ReturnDecideSerializer,
        responses={200: ReturnRequestSerializer},
    )
    def post(self, request: Request, order_id: int) -> Response:
        store = getattr(request, "seller_store", None) or (
            StoreSelector.get_store_by_owner(request.user.id)
        )
        order = OrderSelector.get_store_order(store.id, order_id) if store else None
        if order is None:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReturnDecideSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            rr = DecideReturnService.execute(
                order=order,
                approve=serializer.validated_data["approve"],
                note=serializer.validated_data.get("note", ""),
            )
        except OrderNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except InvalidOrderStatusError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        return Response(ReturnRequestSerializer(rr).data)
