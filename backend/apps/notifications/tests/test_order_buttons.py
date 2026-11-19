import pytest

from apps.accounts.models import TelegramAccount
from apps.notifications.telegram.bot import handle_update
from apps.orders.models import Order, OrderItem
from apps.orders.services.create_order import CreateOrderService  # noqa: F401

pytestmark = pytest.mark.django_db(transaction=True)

SELLER_TG = "700"


@pytest.fixture
def calls(monkeypatch):
    log = {"send": [], "edit": [], "answer": []}
    base = "apps.notifications.telegram.client."
    monkeypatch.setattr(
        base + "send_message",
        lambda chat_id, text, **kw: log["send"].append((str(chat_id), text, kw)),
    )
    monkeypatch.setattr(
        base + "edit_message",
        lambda chat_id, message_id, text, **kw: log["edit"].append((chat_id, message_id, text, kw)),
    )
    monkeypatch.setattr(
        base + "answer_callback_query",
        lambda cid, text="", **kw: log["answer"].append((cid, text, kw)),
    )
    return log


@pytest.fixture
def order(user, shop, address):
    store, product = shop
    TelegramAccount.objects.create(user=store.owner, telegram_id=SELLER_TG)
    TelegramAccount.objects.create(user=user, telegram_id="800")
    product.stock -= 2
    product.save()
    o = Order.objects.create(
        customer=user, store=store, address=address,
        delivery_price="5", subtotal="20", total="25", note="eshik oldida",
    )
    OrderItem.objects.create(order=o, product=product, price="10", quantity=2, subtotal="20")
    return o


def tap(order, action, sender=SELLER_TG):
    handle_update(
        {
            "callback_query": {
                "id": "cb1",
                "from": {"id": int(sender)},
                "data": f"order:{action}:{order.pk}",
                "message": {"message_id": 42, "chat": {"id": int(sender)}},
            }
        }
    )


def test_new_order_message_carries_accept_and_reject_buttons(order, calls):
    from apps.notifications.telegram.services import notify_seller_new_order

    notify_seller_new_order(order_id=order.pk)
    chat, text, kw = calls["send"][0]
    assert chat == SELLER_TG
    assert "Yangi buyurtma" in text and "Plov × 2" in text and "eshik oldida" in text
    labels = [(label, data) for row in kw["actions"] for label, data in row]
    assert ("✅ Qabul qilish", f"order:accept:{order.pk}") in labels
    assert ("❌ Rad etish", f"order:reject:{order.pk}") in labels


def test_accept_button_moves_order_notifies_customer_and_rerenders(order, calls):
    tap(order, "accept")
    order.refresh_from_db()
    assert order.status == "ACCEPTED"
    assert calls["answer"][0][1] == "Bajarildi ✅"
    assert any(c[0] == "800" and "qabul" in c[1] for c in calls["send"])  # customer told
    _, msg_id, text, kw = calls["edit"][0]
    assert msg_id == 42 and "Qabul qilindi" in text
    assert [d for row in kw["actions"] for _, d in row] == [
        f"order:deliver:{order.pk}", f"order:cancel:{order.pk}",
    ]


def test_full_flow_through_buttons(order, calls):
    for action in ("accept", "deliver", "complete"):
        tap(order, action)
    order.refresh_from_db()
    assert order.status == "COMPLETED"
    assert calls["edit"][-1][3]["actions"] == []  # no buttons on a finished order


def test_reject_button_restocks(order, calls, shop):
    _, product = shop
    tap(order, "reject")
    order.refresh_from_db()
    product.refresh_from_db()
    assert order.status == "REJECTED" and product.stock == 5


def test_stranger_and_unlinked_senders_are_refused(order, calls, django_user_model):
    other = django_user_model.objects.create_user(
        phone="+998900000090", password="x12345678", first_name="Other"
    )
    TelegramAccount.objects.create(user=other, telegram_id="901")
    tap(order, "accept", sender="901")  # linked, but not this store's owner
    tap(order, "accept", sender="999")  # no linked account at all
    order.refresh_from_db()
    assert order.status == "PENDING"
    assert all(a[2].get("alert") for a in calls["answer"]) and len(calls["answer"]) == 2
    assert calls["edit"] == []


def test_stale_button_reports_and_refreshes(order, calls):
    tap(order, "accept")
    tap(order, "reject")  # reject is no longer valid once ACCEPTED
    assert calls["answer"][1][1] == "Buyurtma holati allaqachon o'zgargan."
    order.refresh_from_db()
    assert order.status == "ACCEPTED"
    assert "Qabul qilindi" in calls["edit"][1][2]


def test_garbage_callback_data_is_ignored(order, calls):
    handle_update({"callback_query": {"id": "x", "from": {"id": 700}, "data": "hack"}})
    handle_update({"callback_query": {"id": "x", "from": {"id": 700}, "data": "order:accept:abc"}})
    order.refresh_from_db()
    assert order.status == "PENDING" and calls["edit"] == []
