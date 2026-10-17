import pytest

from apps.orders.models import Order, OrderItem
from apps.orders.services import CancelOrderService, RejectOrderService

pytestmark = pytest.mark.django_db


def _order(user, store, product, address, qty=2):
    product.stock -= qty  # what CreateOrderService does at checkout
    product.save()
    order = Order.objects.create(
        customer=user, store=store, address=address,
        delivery_price="0", subtotal="20", total="20",
    )
    OrderItem.objects.create(order=order, product=product, price="10", quantity=qty, subtotal="20")
    return order


def test_cancel_returns_stock(user, shop, address):
    store, product = shop
    order = _order(user, store, product, address)
    assert product.stock == 3
    CancelOrderService.execute(order=order, actor=user)
    product.refresh_from_db()
    assert product.stock == 5


def test_reject_returns_stock(user, shop, address):
    store, product = shop
    order = _order(user, store, product, address)
    RejectOrderService.execute(order=order, reason="no")
    product.refresh_from_db()
    assert product.stock == 5


def test_unlimited_stock_untouched(user, shop, address):
    store, product = shop
    order = _order(user, store, product, address)
    product.stock = None
    product.save()
    CancelOrderService.execute(order=order, actor=user)
    product.refresh_from_db()
    assert product.stock is None
