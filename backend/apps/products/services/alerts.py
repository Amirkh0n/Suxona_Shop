"""Stock / price alerts: back-in-stock, price drop (favourites) and low-stock (seller)."""

from __future__ import annotations

from decimal import Decimal

from apps.common.enums import ProductStatus
from apps.notifications.telegram.services import notify_event
from apps.products.models import Favorite, Product, StockSubscription

LIVE = (ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK)


def _path(product: Product) -> str:
    return f"/mahsulot/{product.pk}"


def fire_back_in_stock(*, product_id: int) -> None:
    """Notify and clear subscribers once the product can be bought again."""
    product = Product.objects.filter(pk=product_id).first()
    if product is None or product.status not in LIVE:
        return
    if product.stock is not None and product.stock <= 0:
        return
    subs = StockSubscription.objects.filter(product=product)
    user_ids = list(subs.values_list("user_id", flat=True))
    if not user_ids:
        return
    subs.delete()
    for uid in user_ids:
        notify_event(
            user_id=uid,
            kind="product",
            title=f"“{product.name}” yana sotuvda",
            body="Siz kutgan mahsulot omborga qaytdi.",
            path=_path(product),
        )


def fire_price_drop(*, product_id: int, old_price: Decimal) -> None:
    product = Product.objects.filter(pk=product_id).first()
    if product is None or product.status != ProductStatus.ACTIVE or product.price >= old_price:
        return
    fmt = lambda v: f"{int(v):,}".replace(",", " ")  # noqa: E731
    for uid in Favorite.objects.filter(product=product).values_list("user_id", flat=True):
        notify_event(
            user_id=uid,
            kind="product",
            title=f"“{product.name}” arzonlashdi",
            body=f"{fmt(old_price)} → {fmt(product.price)} so'm",
            path=_path(product),
        )


def fire_low_stock(*, product_id: int) -> None:
    product = Product.objects.select_related("store").filter(pk=product_id).first()
    if product is None or product.stock is None:
        return
    notify_event(
        user_id=product.store.owner_id,
        kind="product",
        title=f"Zaxira kam: “{product.name}”",
        body="Mahsulot tugadi." if product.stock == 0 else f"Omborda {product.stock} dona qoldi.",
        path=f"/sotuvchi/mahsulotlar/{product.pk}",
    )
