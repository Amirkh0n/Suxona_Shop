import pytest
from django.contrib.auth import get_user_model

from apps.accounts.models import Address, TelegramAccount
from apps.products.models import Category, Product
from apps.stores.models import Store, StoreApplication, Village


@pytest.fixture
def user(db):
    return get_user_model().objects.create_user(
        phone="+998900000001", password="pw12345678", first_name="Ali"
    )


@pytest.fixture
def staff(db):
    return get_user_model().objects.create_superuser(
        phone="+998900000099", password="pw12345678", first_name="Admin"
    )


@pytest.fixture
def linked_user(user):
    TelegramAccount.objects.create(user=user, telegram_id="555", username="ali")
    return user


@pytest.fixture
def application(linked_user):
    return StoreApplication.objects.create(
        owner=linked_user, store_name="Baraka", phone="+998901112233"
    )


@pytest.fixture
def sent(monkeypatch):
    """Capture Telegram messages instead of hitting the network."""
    messages = []
    monkeypatch.setattr(
        "apps.notifications.telegram.client.send_message",
        lambda chat_id, text, **kw: messages.append((str(chat_id), text)),
    )
    return messages


@pytest.fixture
def shop(db, staff):
    owner = get_user_model().objects.create_user(
        phone="+998900000050", password="pw12345678", first_name="Seller"
    )
    store = Store.objects.create(owner=owner, name="S", phone="+998900000050", status="ACTIVE")
    category = Category.objects.create(name="Food")
    product = Product.objects.create(
        store=store, category=category, name="Plov", price="10.00", stock=5, status="ACTIVE"
    )
    return store, product


@pytest.fixture
def address(user):
    village = Village.objects.create(name="V", district="D")
    return Address.objects.create(user=user, village=village, street="s", house="1")
