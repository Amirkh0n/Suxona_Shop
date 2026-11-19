from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.enums import OrderStatus
from apps.common.permissions import IsSeller
from apps.orders.models import Order, OrderItem
from apps.stores.selectors import StoreSelector


@extend_schema(tags=["Orders"])
class SellerStatsView(APIView):
    permission_classes = [IsSeller]

    @extend_schema(
        summary="Sales statistics for my store (seller)",
        parameters=[OpenApiParameter("days", int, description="Window, 1-365 (default 30).")],
    )
    def get(self, request: Request) -> Response:
        store = getattr(request, "seller_store", None) or (
            StoreSelector.get_store_by_owner(request.user.id)
        )
        if store is None:
            return Response({"detail": "Store not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            days = min(max(int(request.query_params.get("days", 30)), 1), 365)
        except ValueError:
            days = 30
        since = timezone.now() - timedelta(days=days - 1)
        since = since.replace(hour=0, minute=0, second=0, microsecond=0)

        orders = Order.objects.filter(store=store, created_at__gte=since)
        completed = orders.filter(status=OrderStatus.COMPLETED)
        revenue = completed.aggregate(s=Sum("total"))["s"] or Decimal("0")
        completed_count = completed.count()

        by_status = {
            row["status"]: row["n"]
            for row in orders.values("status").annotate(n=Count("id"))
        }
        daily = {
            row["day"]: row
            for row in completed.annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(orders=Count("id"), revenue=Sum("total"))
        }
        series = []
        for i in range(days):
            day = (since + timedelta(days=i)).date()
            row = daily.get(day)
            series.append(
                {
                    "date": day.isoformat(),
                    "orders": row["orders"] if row else 0,
                    "revenue": row["revenue"] if row else Decimal("0"),
                }
            )
        top = (
            OrderItem.objects.filter(order__in=completed)
            .values("product_id", "product__name")
            .annotate(quantity=Sum("quantity"), revenue=Sum("subtotal"))
            .order_by("-quantity")[:5]
        )
        return Response(
            {
                "days": days,
                "orders_total": orders.count(),
                "orders_completed": completed_count,
                "pending_now": Order.objects.filter(
                    store=store, status=OrderStatus.PENDING
                ).count(),
                "revenue": revenue,
                "average_order": (revenue / completed_count) if completed_count else Decimal("0"),
                "by_status": by_status,
                "daily": series,
                "top_products": [
                    {
                        "product_id": r["product_id"],
                        "name": r["product__name"],
                        "quantity": r["quantity"],
                        "revenue": r["revenue"],
                    }
                    for r in top
                ],
            }
        )
