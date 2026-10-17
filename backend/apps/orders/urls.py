from django.urls import path

from apps.orders.views import (
    AcceptOrderView,
    CancelOrderView,
    CartItemCreateView,
    CartItemDetailView,
    CartView,
    CompleteOrderView,
    MarkDeliveringOrderView,
    MyOrdersView,
    OrderCreateView,
    OrderDetailView,
    RejectOrderView,
    SellerOrderListView,
)

app_name = "orders"

urlpatterns = [
    # Cart
    path("cart", CartView.as_view(), name="cart"),
    path("cart/items", CartItemCreateView.as_view(), name="cart-item-create"),
    path(
        "cart/items/<int:item_id>",
        CartItemDetailView.as_view(),
        name="cart-item-detail",
    ),
    # Orders (customer)
    path("orders", OrderCreateView.as_view(), name="order-create"),
    path("orders/my", MyOrdersView.as_view(), name="order-my"),
    # Seller orders
    path("orders/store", SellerOrderListView.as_view(), name="order-store-list"),
    path(
        "orders/<int:order_id>/accept",
        AcceptOrderView.as_view(),
        name="order-accept",
    ),
    path(
        "orders/<int:order_id>/reject",
        RejectOrderView.as_view(),
        name="order-reject",
    ),
    path(
        "orders/<int:order_id>/delivering",
        MarkDeliveringOrderView.as_view(),
        name="order-delivering",
    ),
    path(
        "orders/<int:order_id>/complete",
        CompleteOrderView.as_view(),
        name="order-complete",
    ),
    path(
        "orders/<int:order_id>/cancel",
        CancelOrderView.as_view(),
        name="order-cancel",
    ),
    # Order detail (kept last so static segments above take precedence)
    path("orders/<int:order_id>", OrderDetailView.as_view(), name="order-detail"),
]
