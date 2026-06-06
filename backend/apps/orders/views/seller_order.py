from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import ServiceError
from apps.common.permissions import IsSeller
from apps.orders.exceptions import InvalidOrderStatusError, OrderNotFound
from apps.orders.selectors import OrderSelector
from apps.orders.serializers import (
    OrderDetailSerializer,
    OrderListSerializer,
    OrderRejectSerializer,
)
from apps.orders.services import (
    AcceptOrderService,
    CompleteOrderService,
    MarkDeliveringService,
    RejectOrderService,
)
from apps.orders.views.base import PaginatedAPIView
from apps.stores.selectors import StoreSelector


class SellerOrderListView(PaginatedAPIView):
    permission_classes = [IsSeller]

    def get(self, request: Request) -> Response:
        store = getattr(request, "seller_store", None) or (
            StoreSelector.get_store_by_owner(request.user.id)
        )
        if store is None:
            return Response(
                {"detail": "Store not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        orders = OrderSelector.get_store_orders(store.id)

        status_filter = request.query_params.get("status")
        if status_filter:
            orders = orders.filter(status=status_filter)

        return self.paginate(orders, OrderListSerializer, request)


class _SellerOrderActionView(APIView):
    """Base for seller order state-transition actions.

    Resolves the seller's store, scopes the order to that store (so a seller
    can act only on their own store's orders), delegates to the service, and
    returns the refreshed order.
    """

    permission_classes = [IsSeller]
    service = None

    def _service_kwargs(self, request: Request) -> dict:
        return {}

    def post(self, request: Request, order_id: int) -> Response:
        store = getattr(request, "seller_store", None) or (
            StoreSelector.get_store_by_owner(request.user.id)
        )
        if store is None:
            return Response(
                {"detail": "Store not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        order = OrderSelector.get_store_order(store.id, order_id)
        if order is None:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            self.service.execute(order=order, **self._service_kwargs(request))
        except OrderNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except InvalidOrderStatusError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        refreshed = OrderSelector.get_order_by_id(order_id)
        return Response(
            OrderDetailSerializer(refreshed).data,
            status=status.HTTP_200_OK,
        )


class AcceptOrderView(_SellerOrderActionView):
    service = AcceptOrderService


class MarkDeliveringOrderView(_SellerOrderActionView):
    service = MarkDeliveringService


class CompleteOrderView(_SellerOrderActionView):
    service = CompleteOrderService


class RejectOrderView(_SellerOrderActionView):
    service = RejectOrderService

    def _service_kwargs(self, request: Request) -> dict:
        serializer = OrderRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reason = serializer.validated_data.get("reason", "")
        return {"reason": reason}
