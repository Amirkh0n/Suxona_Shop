from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.selectors import AddressSelector
from apps.common.exceptions import ServiceError
from apps.common.permissions import (
    IsAuthenticatedUser,
    IsOrderOwner,
    IsOrderOwnerOrStoreOwner,
)
from apps.orders.exceptions import (
    AddressOwnershipError,
    CartNotFoundError,
    DeliveryZoneNotFoundError,
    EmptyStoreCartError,
    InsufficientStockError,
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
from apps.orders.services import CancelOrderService, CreateOrderService
from apps.orders.views.base import PaginatedAPIView
from apps.stores.selectors import StoreSelector


class OrderCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

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
            order = CreateOrderService.execute(
                customer=request.user,
                store=store,
                address=address,
                note=data.get("note", ""),
            )
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

        created = OrderSelector.get_order_by_id(order.pk)
        return Response(
            OrderDetailSerializer(created).data,
            status=status.HTTP_201_CREATED,
        )


class MyOrdersView(PaginatedAPIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request: Request) -> Response:
        orders = OrderSelector.get_customer_orders(request.user.id)
        return self.paginate(orders, OrderListSerializer, request)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticatedUser]

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


class CancelOrderView(APIView):
    permission_classes = [IsAuthenticatedUser, IsOrderOwner]

    def post(self, request: Request, order_id: int) -> Response:
        order = OrderSelector.get_order_by_id(order_id)
        if order is None:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        self.check_object_permissions(request, order)

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
