from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.selectors import AddressSelector
from apps.common.exceptions import ServiceError
from apps.common.permissions import (
    IsAuthenticatedUser,
    IsOrderOwnerOrStoreOwner,
)
from apps.common.schema import DetailSerializer
from apps.orders.exceptions import (
    AddressOwnershipError,
    CartNotFoundError,
    DeliveryZoneNotFoundError,
    EmptyStoreCartError,
    IdempotencyKeyReuseError,
    InsufficientStockError,
    InvalidIdempotencyKeyError,
    InvalidOrderStatusError,
    NotOrderOwnerError,
    OrderNotFound,
    ProductNotActiveError,
    StoreNotActiveError,
)
from apps.orders.selectors import OrderSelector
from apps.orders.serializers import (
    OrderCreateSerializer,
    OrderDetailSerializer,
    OrderListSerializer,
)
from apps.orders.services import CancelOrderService, IdempotentCreateOrderService
from apps.orders.views.base import PaginatedAPIView
from apps.stores.selectors import StoreSelector


@extend_schema(tags=["Orders"])
class OrderCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(
        summary="Create an order from the store cart",
        description=(
            "Send an `Idempotency-Key` header (8-128 chars) to make the call "
            "safe to retry: a repeat with the same key and payload returns the "
            "original order with 200 and `Idempotent-Replayed: true` instead of "
            "creating a second one."
        ),
        parameters=[
            OpenApiParameter(
                "Idempotency-Key", str, OpenApiParameter.HEADER, required=False
            ),
        ],
        request=OrderCreateSerializer,
        responses={
            200: OrderDetailSerializer,
            201: OrderDetailSerializer,
            422: OpenApiResponse(
                DetailSerializer, "Idempotency-Key reused with a different request."
            ),
            400: OpenApiResponse(DetailSerializer, "Validation or service error."),
            403: OpenApiResponse(DetailSerializer, "Address not owned."),
            404: OpenApiResponse(DetailSerializer, "Store/address/zone not found."),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        store = StoreSelector.get_store_by_id(data["store_id"])
        if store is None:
            return Response(
                {"detail": "Store not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        address = AddressSelector.get_user_address(
            request.user.id,
            data["address_id"],
        )
        if address is None:
            return Response(
                {"detail": "Address not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            order, created = IdempotentCreateOrderService.execute(
                key=request.headers.get("Idempotency-Key"),
                customer=request.user,
                store=store,
                address=address,
                note=data.get("note", ""),
            )
        except IdempotencyKeyReuseError as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
        except InvalidIdempotencyKeyError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except AddressOwnershipError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except (CartNotFoundError, DeliveryZoneNotFoundError) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except (
            StoreNotActiveError,
            EmptyStoreCartError,
            ProductNotActiveError,
            InsufficientStockError,
        ) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        fresh = OrderSelector.get_order_by_id(order.pk)
        response = Response(
            OrderDetailSerializer(fresh).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
        if not created:
            response["Idempotent-Replayed"] = "true"
        return response


@extend_schema(tags=["Orders"])
class MyOrdersView(PaginatedAPIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(
        summary="List my orders",
        responses={200: OrderListSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        orders = OrderSelector.get_customer_orders(request.user.id)
        return self.paginate(orders, OrderListSerializer, request)


@extend_schema(tags=["Orders"])
class OrderDetailView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(
        summary="Get an order",
        responses={
            200: OrderDetailSerializer,
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
    )
    def get(self, request: Request, order_id: int) -> Response:
        order = OrderSelector.get_order_by_id(order_id)

        # Collapse "forbidden" and "missing" into a single 404 so that
        # non-owners cannot enumerate order IDs by distinguishing a 403
        # (exists) from a 404 (missing).
        if order is None or not IsOrderOwnerOrStoreOwner().has_object_permission(
            request, self, order
        ):
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Orders"])
class CancelOrderView(APIView):
    permission_classes = [IsAuthenticatedUser, IsOrderOwnerOrStoreOwner]

    @extend_schema(
        summary="Cancel an order",
        description=(
            "Customer: while PENDING. Store owner: while ACCEPTED. "
            "Staff: any non-terminal status. See orders.state_machine."
        ),
        request=None,
        responses={
            200: OrderDetailSerializer,
            403: OpenApiResponse(DetailSerializer, "Not the order owner."),
            404: OpenApiResponse(DetailSerializer, "Not found."),
            409: OpenApiResponse(DetailSerializer, "Order not cancellable."),
        },
    )
    def post(self, request: Request, order_id: int) -> Response:
        order = OrderSelector.get_order_by_id(order_id)
        # Same rule as the detail view: strangers get 404, not 403, so order
        # ids cannot be enumerated.
        if order is None or not IsOrderOwnerOrStoreOwner().has_object_permission(
            request, self, order
        ):
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            CancelOrderService.execute(order=order, actor=request.user)
        except OrderNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except NotOrderOwnerError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except InvalidOrderStatusError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        refreshed = OrderSelector.get_order_by_id(order_id)
        return Response(
            OrderDetailSerializer(refreshed).data,
            status=status.HTTP_200_OK,
        )
