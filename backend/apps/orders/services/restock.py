from django.db.models import F

from apps.orders.models import Order
from apps.products.models import Product, ProductVariant


def restock_order_items(order: Order) -> None:
    """Return an order's reserved stock to inventory.

    ``CreateOrderService`` decrements stock the moment an order is placed, so
    any path that ends an order without fulfilling it (customer cancel, seller
    reject) must put the units back — otherwise inventory shrinks permanently
    on every cancelled order. Mirrors the decrement rule exactly: variant stock
    when the line has a tracked variant, else product stock; ``None`` stock
    means "unlimited" and is left alone. Uses F() so concurrent orders can't
    clobber each other. Call inside the caller's transaction.
    """
    for item in order.items.select_related("product", "variant"):
        if item.variant_id is not None and item.variant.stock is not None:
            ProductVariant.objects.filter(pk=item.variant_id).update(
                stock=F("stock") + item.quantity
            )
        elif item.variant_id is None and item.product.stock is not None:
            Product.objects.filter(pk=item.product_id).update(
                stock=F("stock") + item.quantity
            )
        elif item.variant_id is not None and item.product.stock is not None:
            # Variant without its own tracked stock fell back to product stock
            # at checkout, so restore it there.
            Product.objects.filter(pk=item.product_id).update(
                stock=F("stock") + item.quantity
            )
