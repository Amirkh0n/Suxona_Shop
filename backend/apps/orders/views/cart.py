from types import SimpleNamespace

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAuthenticatedUser
from apps.orders.exceptions import (
    CartItemNotFound,
    InvalidQuantityError,
    NotCartOwnerError,
    ProductNotPurchasable,
)
from apps.orders.models import CartItem
from apps.orders.selectors import CartItemSelector, CartSelector
from apps.orders.serializers import (
    CartItemCreateSerializer,
    CartItemSerializer,
    CartItemUpdateSerializer,
    CartSerializer,
)
from apps.orders.services import (
    AddCartItemService,
    ClearCartService,
    DeleteCartItemService,
    UpdateCartItemService,
)


def _build_grouped_cart(cart) -> dict:
    """Assemble the grouped-by-store structure expected by CartSerializer."""
    stores: list[SimpleNamespace] = []
    if cart is not None:
        items = list(CartItemSelector.get_cart_items(cart.id))
        groups: dict[int, SimpleNamespace] = {}
        for item in items:
            store = item.product.store
            group = groups.get(store.id)
            if group is None:
                group = SimpleNamespace(
                    store_id=store.id,
                    store_name=store.name,
                    items=[],
                )
                groups[store.id] = group
                stores.append(group)
            group.items.append(item)
    return {"stores": stores}


class CartView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request: Request) -> Response:
        cart = CartSelector.get_user_cart(request.user.id)
        payload = _build_grouped_cart(cart)
        return Response(
            CartSerializer(payload).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request: Request) -> Response:
        ClearCartService.execute(user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartItemCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def post(self, request: Request) -> Response:
        serializer = CartItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            item = AddCartItemService.execute(
                user=request.user,
                **serializer.validated_data,
            )
        except ProductNotPurchasable as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except InvalidQuantityError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            CartItemSerializer(item).data,
            status=status.HTTP_201_CREATED,
        )


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def _get_item_or_none(self, item_id: int) -> CartItem | None:
        return CartItemSelector.get_cart_item_by_id(item_id)

    def patch(self, request: Request, item_id: int) -> Response:
        item = self._get_item_or_none(item_id)
        if item is None:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CartItemUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            item = UpdateCartItemService.execute(
                user=request.user,
                cart_item=item,
                **serializer.validated_data,
            )
        except CartItemNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except NotCartOwnerError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except InvalidQuantityError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            CartItemSerializer(item).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request: Request, item_id: int) -> Response:
        item = self._get_item_or_none(item_id)
        if item is None:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            DeleteCartItemService.execute(user=request.user, cart_item=item)
        except CartItemNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except NotCartOwnerError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)
