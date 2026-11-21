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
    OrderPrintView,
    PromoCheckView,
    RejectOrderView,
    ReorderView,
    ReturnRequestCreateView,
    ReturnRequestDecideView,
    SellerOrderListView,
    SellerOrdersExportView,
    SellerPromoDetailView,
    SellerPromoListCreateView,
    SellerStatsView,
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
    path("orders/store/stats", SellerStatsView.as_view(), name="seller-stats"),
    path("orders/store/export", SellerOrdersExportView.as_view(), name="seller-orders-export"),
    path("orders/<int:order_id>/print", OrderPrintView.as_view(), name="order-print"),
    path("orders/<int:order_id>/reorder", ReorderView.as_view(), name="order-reorder"),
    path("stores/my/promo-codes", SellerPromoListCreateView.as_view(), name="seller-promo-list"),
    path(
        "stores/my/promo-codes/<int:promo_id>",
        SellerPromoDetailView.as_view(),
        name="seller-promo-detail",
    ),
    path("orders/<int:order_id>/return", ReturnRequestCreateView.as_view(), name="order-return"),
    path(
        "orders/<int:order_id>/return/decide",
        ReturnRequestDecideView.as_view(),
        name="order-return-decide",
    ),
    path("promo/check", PromoCheckView.as_view(), name="promo-check"),
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
