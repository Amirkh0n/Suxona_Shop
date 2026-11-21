"""Seller/customer conveniences: stock alerts, CSV import/export, review replies."""

import csv
import io
from decimal import Decimal, InvalidOperation

from django.http import HttpResponse
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.parsers import MultiPartParser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.enums import ProductStatus
from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAuthenticatedUser, IsSeller
from apps.products.models import Category, Product, ProductReview, StockSubscription
from apps.products.selectors import ProductSelector
from apps.products.services import CreateProductService, UpdateProductService
from apps.stores.selectors import StoreSelector

PUBLIC = (ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK)
MAX_IMPORT_ROWS = 500
MAX_IMPORT_BYTES = 1_000_000
COLUMNS = ["sku", "name", "category", "price", "old_price", "stock", "description"]


def _my_store(request: Request):
    return getattr(request, "seller_store", None) or StoreSelector.get_store_by_owner(
        request.user.id
    )


@extend_schema(tags=["Products"])
class StockAlertView(APIView):
    """"Notify me when it is back in stock" — PUT subscribes, DELETE cancels."""

    permission_classes = [IsAuthenticatedUser]

    @extend_schema(summary="Notify me when this product is back in stock", responses={204: None})
    def put(self, request: Request, product_id: int) -> Response:
        if not Product.objects.filter(pk=product_id, status__in=PUBLIC).exists():
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        StockSubscription.objects.get_or_create(user=request.user, product_id=product_id)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(summary="Cancel the back-in-stock alert", responses={204: None})
    def delete(self, request: Request, product_id: int) -> Response:
        StockSubscription.objects.filter(user=request.user, product_id=product_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(tags=["Products"])
class StockAlertIdsView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(summary="Ids of products I am waiting for")
    def get(self, request: Request) -> Response:
        ids = StockSubscription.objects.filter(user=request.user).values_list(
            "product_id", flat=True
        )
        return Response({"ids": list(ids)})


@extend_schema(tags=["Products"])
class ProductCsvExportView(APIView):
    permission_classes = [IsSeller]

    @extend_schema(summary="Export my products as CSV (seller)", responses={200: str})
    def get(self, request: Request) -> HttpResponse:
        store = _my_store(request)
        if store is None:
            return Response({"detail": "Store not found."}, status=status.HTTP_404_NOT_FOUND)
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="products.csv"'
        response.write("﻿")
        w = csv.writer(response)
        w.writerow(COLUMNS)
        for p in ProductSelector.get_store_products(store.id).select_related("category"):
            w.writerow([
                p.sku, p.name, p.category.name, p.price,
                p.old_price if p.old_price is not None else "",
                p.stock if p.stock is not None else "", p.description,
            ])
        return response


class CsvUploadSerializer(serializers.Serializer):
    file = serializers.FileField()


def _num(value: str, cls):
    value = (value or "").strip().replace(" ", "").replace(",", ".")
    if value == "":
        return None
    try:
        return cls(value)
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(f"'{value}' son emas") from exc


@extend_schema(tags=["Products"])
class ProductCsvImportView(APIView):
    """Create new products / update existing ones (matched by SKU, else by name) from a CSV.

    Columns: sku, name, category (name or id), price, old_price, stock, description.
    New products start as DRAFT. Row errors are reported; valid rows are still applied.
    """

    permission_classes = [IsSeller]
    parser_classes = [MultiPartParser]

    @extend_schema(
        summary="Import products from CSV (seller)", request=CsvUploadSerializer
    )
    def post(self, request: Request) -> Response:
        store = _my_store(request)
        if store is None:
            return Response({"detail": "Store not found."}, status=status.HTTP_404_NOT_FOUND)
        ser = CsvUploadSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        upload = ser.validated_data["file"]
        if upload.size > MAX_IMPORT_BYTES:
            return Response({"detail": "Fayl juda katta."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            text = upload.read().decode("utf-8-sig")
        except UnicodeDecodeError:
            return Response(
                {"detail": "Fayl UTF-8 kodlashda bo'lishi kerak."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        sample = text[:2048]
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
        except csv.Error:
            dialect = csv.excel
        rows = list(csv.DictReader(io.StringIO(text), dialect=dialect))
        if not rows or "name" not in (rows[0].keys()):
            return Response(
                {"detail": "Birinchi qatorda 'name' ustuni bo'lishi kerak."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(rows) > MAX_IMPORT_ROWS:
            return Response(
                {"detail": f"Bir martada {MAX_IMPORT_ROWS} tadan ko'p qator mumkin emas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        categories = {c.name.lower(): c.id for c in Category.objects.all()}
        created = updated = 0
        errors: list[dict] = []
        for line, row in enumerate(rows, start=2):
            row = {(k or "").strip().lower(): (v or "").strip() for k, v in row.items()}
            try:
                name = row.get("name", "")
                if not name:
                    raise ValueError("name bo'sh")
                price = _num(row.get("price"), Decimal)
                old_price = _num(row.get("old_price"), Decimal)
                stock = _num(row.get("stock"), int)
                cat_raw = row.get("category", "")
                category_id = (
                    int(cat_raw) if cat_raw.isdigit() else categories.get(cat_raw.lower())
                )
                sku = row.get("sku", "")
                existing = None
                if sku:
                    existing = Product.objects.filter(store=store, sku=sku).first()
                if existing is None:
                    existing = Product.objects.filter(store=store, name=name).first()
                if existing:
                    fields = {"name": name, "description": row.get("description", "")}
                    if price is not None:
                        fields["price"] = price
                    if "old_price" in row:
                        fields["old_price"] = old_price
                    if stock is not None or "stock" in row:
                        fields["stock"] = stock
                    if category_id:
                        fields["category_id"] = category_id
                    if sku:
                        fields["sku"] = sku
                    UpdateProductService.execute(product=existing, actor=request.user, **fields)
                    updated += 1
                else:
                    if price is None:
                        raise ValueError("price kerak")
                    if not category_id:
                        raise ValueError(f"category topilmadi: '{cat_raw}'")
                    CreateProductService.execute(
                        store=store, actor=request.user, category_id=category_id, name=name,
                        price=price, old_price=old_price, stock=stock, sku=sku,
                        description=row.get("description", ""),
                    )
                    created += 1
            except (ServiceError, ValueError) as exc:
                errors.append({"line": line, "name": row.get("name", ""), "error": str(exc)})
        return Response({"created": created, "updated": updated, "errors": errors})


class ReplySerializer(serializers.Serializer):
    reply = serializers.CharField(max_length=1000)


@extend_schema(tags=["Products"])
class ProductReviewReplyView(APIView):
    """The store owner answers (POST) or removes the answer (DELETE) on a product review."""

    permission_classes = [IsSeller]

    def _review(self, request: Request, review_id: int):
        store = _my_store(request)
        if store is None:
            return None
        return ProductReview.objects.filter(pk=review_id, product__store=store).first()

    @extend_schema(summary="Reply to a product review (seller)", request=ReplySerializer)
    def post(self, request: Request, review_id: int) -> Response:
        review = self._review(request, review_id)
        if review is None:
            return Response({"detail": "Review not found."}, status=status.HTTP_404_NOT_FOUND)
        ser = ReplySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        review.seller_reply = ser.validated_data["reply"].strip()
        review.seller_replied_at = timezone.now()
        review.save(update_fields=["seller_reply", "seller_replied_at", "updated_at"])
        from apps.notifications.telegram.services import after_commit, notify_event

        after_commit(
            notify_event,
            user_id=review.customer_id,
            kind="review",
            title="Sotuvchi sharhingizga javob berdi",
            body=review.seller_reply[:200],
            path=f"/mahsulot/{review.product_id}",
        )
        return Response({"seller_reply": review.seller_reply})

    @extend_schema(summary="Remove my reply", responses={204: None})
    def delete(self, request: Request, review_id: int) -> Response:
        review = self._review(request, review_id)
        if review is None:
            return Response({"detail": "Review not found."}, status=status.HTTP_404_NOT_FOUND)
        review.seller_reply, review.seller_replied_at = "", None
        review.save(update_fields=["seller_reply", "seller_replied_at", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)
