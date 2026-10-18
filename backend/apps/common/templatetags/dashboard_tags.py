"""Data for the admin dashboard (templates/admin/index.html).

One small, query-light snapshot of what an operator needs first thing:
what is waiting for them, and how the platform is doing.
"""

from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django import template
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone

from apps.accounts.models import User
from apps.common.enums import OrderStatus, ProductStatus, StoreApplicationStatus, StoreStatus
from apps.orders.models import Order
from apps.products.models import Product
from apps.stores.models import Store, StoreApplication

register = template.Library()

LOW_STOCK_THRESHOLD = 5
CHART_DAYS = 7


@register.simple_tag
def dashboard_stats() -> dict:
    now = timezone.now()
    today = timezone.localdate()
    month_ago = now - timedelta(days=30)

    pending_applications = StoreApplication.objects.filter(
        status=StoreApplicationStatus.PENDING
    )
    revenue = (
        Order.objects.filter(status=OrderStatus.COMPLETED, created_at__gte=month_ago).aggregate(
            total=Sum("total")
        )["total"]
        or Decimal("0")
    )

    # Orders per day for the last CHART_DAYS days (zero-filled).
    start = today - timedelta(days=CHART_DAYS - 1)
    per_day = {
        row["day"]: row["n"]
        for row in Order.objects.filter(created_at__date__gte=start)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(n=Count("id"))
    }
    series = [
        {"day": start + timedelta(days=i), "n": per_day.get(start + timedelta(days=i), 0)}
        for i in range(CHART_DAYS)
    ]
    peak = max((d["n"] for d in series), default=0) or 1
    for d in series:
        d["pct"] = max(6, round(d["n"] * 100 / peak)) if d["n"] else 4

    return {
        "pending_applications": pending_applications.count(),
        "pending_orders": Order.objects.filter(status=OrderStatus.PENDING).count(),
        "orders_today": Order.objects.filter(created_at__date=today).count(),
        "revenue_30d": revenue,
        "active_stores": Store.objects.filter(status=StoreStatus.ACTIVE).count(),
        "users": User.objects.count(),
        "low_stock": Product.objects.filter(
            status=ProductStatus.ACTIVE, stock__isnull=False, stock__lte=LOW_STOCK_THRESHOLD
        ).count(),
        "low_stock_threshold": LOW_STOCK_THRESHOLD,
        "recent_applications": list(
            pending_applications.select_related("owner").order_by("created_at")[:6]
        ),
        "recent_orders": list(
            Order.objects.select_related("store", "customer").order_by("-created_at")[:8]
        ),
        "orders_chart": series,
    }
