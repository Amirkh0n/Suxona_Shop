from decimal import Decimal

from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsAuthenticatedUser
from apps.orders.exceptions import InvalidPromoCodeError
from apps.orders.models import CartItem
from apps.orders.services.promo import validate_promo
from apps.stores.selectors import StoreSelector


class PromoCheckSerializer(serializers.Serializer):
    store_id = serializers.IntegerField(min_value=1)
    code = serializers.CharField(max_length=40)


@extend_schema(tags=["Orders"])
class PromoCheckView(APIView):
    """Preview a promo code against the caller's cart for one store."""

    permission_classes = [IsAuthenticatedUser]

    @extend_schema(summary="Check a promo code for my cart", request=PromoCheckSerializer)
    def post(self, request: Request) -> Response:
        serializer = PromoCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        store = StoreSelector.get_store_by_id(data["store_id"])
        if store is None:
            return Response({"detail": "Store not found."}, status=status.HTTP_404_NOT_FOUND)
        items = CartItem.objects.filter(
            cart__user=request.user, product__store=store
        ).select_related("product", "variant")
        subtotal = sum(
            (
                (i.variant.price if i.variant and i.variant.price is not None else i.product.price)
                * i.quantity
                for i in items
            ),
            Decimal("0"),
        )
        try:
            promo, discount = validate_promo(
                code=data["code"], store=store, customer=request.user, subtotal=subtotal
            )
        except InvalidPromoCodeError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"code": promo.code, "discount": discount, "subtotal": subtotal})
