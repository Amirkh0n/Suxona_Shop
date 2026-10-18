import pytest

from apps.accounts.models import TelegramAccount
from apps.orders.models import Order, OrderItem
from apps.orders.services import (
    AcceptOrderService,
    CancelOrderService,
    CompleteOrderService,
    MarkDeliveringService,
    RejectOrderService,
)

pytestmark = pytest.mark.django_db(transaction=True)


@pytest.fixture
def order(user, shop, address, linked_user):
    store, product = shop
    TelegramAccount.objects.create(user=store.owner, telegram_id="900")
    o = Order.objects.create(
        customer=user, store=store, address=address,
        delivery_price="0", subtotal="20", total="20000",
    )
    OrderItem.objects.create(order=o, product=product, price="10", quantity=2, subtotal="20")
    return o


def _links(sent_kwargs):
    return [kw.get("links") for kw in sent_kwargs]


@pytest.fixture
def sent_full(monkeypatch):
    out = []
    monkeypatch.setattr(
        "apps.notifications.telegram.client.send_message",
        lambda chat_id, text, **kw: out.append((str(chat_id), text, kw.get("links"))),
    )
    return out


def test_status_changes_notify_customer_with_order_link(order, sent_full, settings):
    settings.FRONTEND_BASE_URL = "https://app.example.com"
    AcceptOrderService.execute(order=order)
    MarkDeliveringService.execute(order=order)
    CompleteOrderService.execute(order=order)
    assert [m[0] for m in sent_full] == ["555", "555", "555"]  # customer's chat
    assert "yetkazib berildi" in sent_full[-1][1]
    assert sent_full[0][2] == [("Buyurtmani ko'rish", f"https://app.example.com/buyurtma/{order.pk}")]


def test_reject_includes_reason(order, sent_full):
    RejectOrderService.execute(order=order, reason="Tugagan <b>")
    assert "Tugagan &lt;b&gt;" in sent_full[0][1]  # escaped


def test_customer_cancel_notifies_seller(order, user, sent_full, settings):
    settings.FRONTEND_BASE_URL = "https://app.example.com"
    CancelOrderService.execute(order=order, actor=user)
    chat, text, links = sent_full[0]
    assert chat == "900"
    assert links == [("Buyurtmalarni ochish", "https://app.example.com/sotuvchi/buyurtmalar")]


def test_new_order_notifies_seller(user, linked_user, shop, address, sent_full):
    from apps.orders.models import Cart, CartItem
    from apps.orders.services import CreateOrderService
    from apps.stores.models import DeliveryZone

    store, product = shop
    TelegramAccount.objects.create(user=store.owner, telegram_id="900")
    DeliveryZone.objects.create(store=store, village=address.village, delivery_price="0")
    cart = Cart.objects.create(user=user)
    CartItem.objects.create(cart=cart, product=product, quantity=1)

    CreateOrderService.execute(customer=user, store=store, address=address)

    assert sent_full and sent_full[0][0] == "900"
    assert "Yangi buyurtma" in sent_full[0][1]
