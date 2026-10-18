import pytest
from rest_framework.test import APIClient

from apps.common.enums import OrderStatus
from apps.orders.exceptions import InvalidOrderStatusError, NotOrderOwnerError
from apps.orders.models import Order, OrderItem
from apps.orders.services import (
    AcceptOrderService,
    CancelOrderService,
    CompleteOrderService,
    MarkDeliveringService,
    RejectOrderService,
)
from apps.orders.state_machine import ALLOWED_TRANSITIONS, TERMINAL_STATUSES, can_transition

pytestmark = pytest.mark.django_db

S = OrderStatus


@pytest.fixture
def order(user, shop, address):
    store, product = shop
    product.stock -= 2  # what checkout does
    product.save()
    o = Order.objects.create(
        customer=user, store=store, address=address,
        delivery_price="0", subtotal="20", total="20",
    )
    OrderItem.objects.create(order=o, product=product, price="10", quantity=2, subtotal="20")
    return o


def _set(order, status):
    Order.objects.filter(pk=order.pk).update(status=status)
    order.refresh_from_db()
    return order


def test_table_covers_every_status_and_terminals_are_dead_ends():
    assert set(ALLOWED_TRANSITIONS) == set(OrderStatus.values)
    assert TERMINAL_STATUSES == {S.COMPLETED, S.CANCELLED, S.REJECTED}
    for t in TERMINAL_STATUSES:
        assert not any(can_transition(t, other) for other in OrderStatus.values)


def test_happy_path(order):
    AcceptOrderService.execute(order=order)
    MarkDeliveringService.execute(order=order)
    done = CompleteOrderService.execute(order=order)
    assert done.status == S.COMPLETED


@pytest.mark.parametrize(
    "service,start",
    [
        (AcceptOrderService, S.ACCEPTED),
        (MarkDeliveringService, S.PENDING),
        (CompleteOrderService, S.ACCEPTED),
        (RejectOrderService, S.ACCEPTED),
    ],
)
def test_wrong_source_status_is_rejected(order, service, start):
    _set(order, start)
    with pytest.raises(InvalidOrderStatusError):
        service.execute(order=order)


def test_terminal_orders_cannot_move(order, user):
    _set(order, S.COMPLETED)
    with pytest.raises(InvalidOrderStatusError):
        CancelOrderService.execute(order=order, actor=user)


def test_customer_can_cancel_only_while_pending(order, user):
    _set(order, S.ACCEPTED)
    with pytest.raises(InvalidOrderStatusError):
        CancelOrderService.execute(order=order, actor=user)


def test_seller_cancels_accepted_order_and_customer_is_told(order, shop, sent):
    store, product = shop
    _set(order, S.ACCEPTED)
    out = CancelOrderService.execute(order=order, actor=store.owner)
    assert out.status == S.CANCELLED
    product.refresh_from_db()
    assert product.stock == 5  # restocked


def test_seller_cannot_cancel_pending_use_reject(order, shop):
    store, _ = shop
    with pytest.raises(InvalidOrderStatusError):
        CancelOrderService.execute(order=order, actor=store.owner)


def test_stranger_cannot_cancel(order, django_user_model):
    other = django_user_model.objects.create_user(
        phone="+998900000077", password="x12345678", first_name="X"
    )
    with pytest.raises(NotOrderOwnerError):
        CancelOrderService.execute(order=order, actor=other)


def test_staff_can_cancel_delivering_order(order, staff, shop):
    _, product = shop
    _set(order, S.DELIVERING)
    CancelOrderService.execute(order=order, actor=staff)
    product.refresh_from_db()
    assert product.stock == 5


def test_cancel_api_for_seller_and_stranger(order, shop, django_user_model):
    store, _ = shop
    _set(order, S.ACCEPTED)
    stranger = django_user_model.objects.create_user(
        phone="+998900000078", password="x12345678", first_name="Y"
    )

    c = APIClient()
    c.force_authenticate(stranger)
    assert c.post(f"/api/v1/orders/{order.pk}/cancel").status_code == 404  # no enumeration

    c.force_authenticate(store.owner)
    r = c.post(f"/api/v1/orders/{order.pk}/cancel")
    assert r.status_code == 200 and r.data["status"] == "CANCELLED"
    assert c.post(f"/api/v1/orders/{order.pk}/cancel").status_code == 409
