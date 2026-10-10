from django.urls import path

from apps.accounts.views import (
    AddressDetailView,
    AddressListCreateView,
    CurrentUserView,
    LoginView,
    RefreshTokenView,
    RegisterView,
    TelegramLinkView,
    TelegramMeView,
    TelegramVerifyView,
)


app_name = "accounts"

urlpatterns = [
    # Auth
    path("auth/register", RegisterView.as_view(), name="register"),
    path("auth/login", LoginView.as_view(), name="login"),
    path("auth/refresh", RefreshTokenView.as_view(), name="refresh"),
    path("auth/me", CurrentUserView.as_view(), name="current-user"),
    path(
        "auth/telegram/verify",
        TelegramVerifyView.as_view(),
        name="telegram-verify",
    ),
    # Addresses
    path("addresses", AddressListCreateView.as_view(), name="address-list"),
    path(
        "addresses/<int:address_id>",
        AddressDetailView.as_view(),
        name="address-detail",
    ),
    # Telegram
    path("telegram/link", TelegramLinkView.as_view(), name="telegram-link"),
    path("telegram/me", TelegramMeView.as_view(), name="telegram-me"),
]
