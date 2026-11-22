"""Convenience endpoints: reorder, printable order slip, stats CSV export, seller promo codes."""

import csv
from datetime import timedelta
from html import escape

from django.http import HttpResponse
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import serializers, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAuthenticatedUser, IsSeller
from apps.common.security import csv_safe
from apps.orders.models import Order, PromoCode
from apps.orders.selectors import OrderSelector
from apps.orders.services.add_cart_item import AddCartItemService
from apps.stores.selectors import StoreSelector


def _my_store(request: Request):
    return getattr(request, "seller_store", None) or StoreSelector.get_store_by_owner(
        request.user.id
    )


@extend_schema(tags=["Orders"])
class ReorderView(APIView):
    """Put the items of a previous order back into the cart (skipping unavailable ones)."""

    permission_classes = [IsAuthenticatedUser]

    @extend_schema(summary="Reorder: add a past order's items to the cart")
    def post(self, request: Request, order_id: int) -> Response:
        order = OrderSelector.get_customer_order(request.user.id, order_id)
        if order is None:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        added, skipped = [], []
        for item in order.items.all():
            try:
                AddCartItemService.execute(
                    user=request.user,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    variant_id=item.variant_id,
                )
                added.append(item.product.name)
            except ServiceError as exc:
                skipped.append({"name": item.product.name, "reason": str(exc)})
        return Response({"store_id": order.store_id, "added": added, "skipped": skipped})


@extend_schema(tags=["Orders"])
class OrderPrintView(APIView):
    """Printable order slip (HTML) for the seller; the client opens it in a print window."""

    permission_classes = [IsSeller]

    @extend_schema(summary="Printable order slip (seller)", responses={200: str})
    def get(self, request: Request, order_id: int) -> HttpResponse:
        store = _my_store(request)
        order = OrderSelector.get_store_order(store.id, order_id) if store else None
        if order is None:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        e = escape
        rows = "".join(
            f"<tr><td>{e(i.product.name)}"
            f"{' · ' + e(str(i.variant)) if i.variant_id else ''}</td>"
            f"<td class=n>{i.quantity}</td><td class=n>{int(i.price):,}</td>"
            f"<td class=n>{int(i.subtotal):,}</td></tr>"
            for i in order.items.all()
        )
        if order.address_id:
            a = order.address
            where = e(f"{a.village}, {a.street}, {a.house} {a.landmark}".strip())
        else:
            where = "Do'kondan olib ketish"
        who = order.contact_name or order.customer.first_name
        phone = order.contact_phone or order.customer.phone
        contact = e(f"{who} {phone}")
        discount_line = (
            f"<br>Chegirma: -{int(order.discount_amount):,} so'm" if order.discount_amount else ""
        )
        html = f"""<!doctype html><html lang="uz"><meta charset="utf-8">
<title>Buyurtma #{order.pk}</title>
<style>body{{font:14px system-ui,sans-serif;margin:24px;max-width:640px}}
table{{width:100%;border-collapse:collapse;margin:12px 0}}
td,th{{border-bottom:1px solid #ccc;padding:6px;text-align:left}}
.n{{text-align:right;white-space:nowrap}}h1{{font-size:20px;margin:0 0 4px}}
.t{{font-size:16px;font-weight:700;text-align:right}}</style>
<h1>{e(store.name)} — buyurtma #{order.pk}</h1>
<div>{order.created_at:%d.%m.%Y %H:%M} · {e(order.get_status_display())}</div>
<p><b>Mijoz:</b> {contact}<br><b>Manzil:</b> {where}<br>
{'<b>Vaqt:</b> ' + e(order.delivery_slot) + '<br>' if order.delivery_slot else ''}
{'<b>Izoh:</b> ' + e(order.note) if order.note else ''}</p>
<table><tr><th>Mahsulot</th><th class=n>Soni</th><th class=n>Narx</th>
<th class=n>Summa</th></tr>{rows}</table>
<div class=n>Yetkazish: {int(order.delivery_price):,} so'm
{discount_line}</div>
<div class=t>Jami: {int(order.total):,} so'm</div></html>"""
        return HttpResponse(html, content_type="text/html; charset=utf-8")


@extend_schema(tags=["Orders"])
class SellerOrdersExportView(APIView):
    permission_classes = [IsSeller]

    @extend_schema(
        summary="Export my store's orders as CSV (seller)",
        parameters=[OpenApiParameter("days", int, description="Window, 1-365 (default 30).")],
        responses={200: str},
    )
    def get(self, request: Request) -> HttpResponse:
        store = _my_store(request)
        if store is None:
            return Response({"detail": "Store not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            days = min(max(int(request.query_params.get("days", 30)), 1), 365)
        except ValueError:
            days = 30
        since = timezone.now() - timedelta(days=days)
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="orders.csv"'
        response.write("﻿")  # BOM so Excel opens UTF-8 correctly
        w = csv.writer(response)
        w.writerow(["id", "sana", "holat", "mijoz", "telefon", "yetkazish", "chegirma", "jami"])
        orders = Order.objects.filter(store=store, created_at__gte=since)
        for o in orders.select_related("customer"):
            w.writerow([
                o.pk, o.created_at.strftime("%Y-%m-%d %H:%M"), o.status,
                csv_safe(o.contact_name or o.customer.first_name),
                csv_safe(o.contact_phone or o.customer.phone),
                o.delivery_method, o.discount_amount, o.total,
            ])
        return response


class PromoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = [
            "id", "code", "kind", "value", "max_discount", "min_order_amount",
            "valid_from", "valid_until", "max_uses", "used_count", "is_active",
        ]
        read_only_fields = ["id", "used_count"]

    def validate(self, attrs):
        kind = attrs.get("kind", getattr(self.instance, "kind", "PERCENT"))
        value = attrs.get("value", getattr(self.instance, "value", None))
        if value is not None and value <= 0:
            raise serializers.ValidationError({"value": "Qiymat noldan katta bo'lishi kerak."})
        if kind == "PERCENT" and value is not None and value > 100:
            raise serializers.ValidationError({"value": "Foiz 100 dan oshmasligi kerak."})
        return attrs

    def validate_code(self, value: str) -> str:
        value = value.strip().upper()
        clash = PromoCode.objects.filter(code=value)
        if self.instance is not None:
            clash = clash.exclude(pk=self.instance.pk)
        if clash.exists():
            raise serializers.ValidationError("Bu promokod band.")
        return value


@extend_schema(tags=["Promo"])
class SellerPromoListCreateView(APIView):
    """A seller's own promo codes; always scoped to their store."""

    permission_classes = [IsSeller]

    @extend_schema(
        summary="List my store's promo codes", responses={200: PromoSerializer(many=True)}
    )
    def get(self, request: Request) -> Response:
        store = _my_store(request)
        qs = PromoCode.objects.filter(store=store).order_by("-created_at") if store else []
        return Response(PromoSerializer(qs, many=True).data)

    @extend_schema(summary="Create a promo code for my store", request=PromoSerializer)
    def post(self, request: Request) -> Response:
        store = _my_store(request)
        if store is None:
            return Response({"detail": "Store not found."}, status=status.HTTP_404_NOT_FOUND)
        ser = PromoSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save(store=store)
        return Response(ser.data, status=status.HTTP_201_CREATED)


@extend_schema(tags=["Promo"])
class SellerPromoDetailView(APIView):
    permission_classes = [IsSeller]

    def _get(self, request: Request, promo_id: int):
        store = _my_store(request)
        return PromoCode.objects.filter(pk=promo_id, store=store).first() if store else None

    @extend_schema(summary="Update my promo code", request=PromoSerializer)
    def patch(self, request: Request, promo_id: int) -> Response:
        promo = self._get(request, promo_id)
        if promo is None:
            return Response({"detail": "Promo not found."}, status=status.HTTP_404_NOT_FOUND)
        ser = PromoSerializer(promo, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    @extend_schema(summary="Delete my promo code", responses={204: None})
    def delete(self, request: Request, promo_id: int) -> Response:
        promo = self._get(request, promo_id)
        if promo is None:
            return Response({"detail": "Promo not found."}, status=status.HTTP_404_NOT_FOUND)
        if promo.used_count:
            promo.is_active = False  # keep history on used codes
            promo.save(update_fields=["is_active", "updated_at"])
        else:
            promo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
