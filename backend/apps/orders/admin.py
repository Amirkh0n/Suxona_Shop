from __future__ import annotations

from django.contrib import admin
from django.db.models import Count

from apps.common.admin import ORDER_STATUS_COLORS, CsvExportMixin, render_status_badge
from apps.orders.models import Cart, CartItem, Order, OrderItem, PromoCode, ReturnRequest


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ("product", "variant", "price", "quantity", "subtotal")
    readonly_fields = ("product", "variant", "price", "quantity", "subtotal")
    autocomplete_fields = ("product", "variant")
    can_delete = False

    def has_add_permission(self, request, obj=None) -> bool:
        return False


@admin.register(Order)
class OrderAdmin(CsvExportMixin, admin.ModelAdmin):
    csv_fields = (
        "id", "created_at", "status", "delivery_method", "customer_phone", "store_name",
        "subtotal", "discount_amount", "delivery_price", "total",
    )

    @admin.display(description="Customer phone")
    def customer_phone(self, obj):
        return obj.customer.phone

    @admin.display(description="Store")
    def store_name(self, obj):
        return obj.store.name

    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    list_per_page = 50
    list_select_related = ("customer", "store", "address")

    list_display = (
        "id",
        "customer",
        "store",
        "status_badge",
        "delivery_method",
        "subtotal",
        "delivery_price",
        "total",
        "created_at",
    )
    list_display_links = ("id", "customer")
    list_filter = ("status", "delivery_method", "store")
    search_fields = ("customer__phone", "store__name", "contact_phone", "promo_code__code")
    autocomplete_fields = ("customer", "store")
    raw_id_fields = ("address",)

    # `status` is read-only on purpose: editing it in the form would bypass the
    # state machine (no restock, no notification). Use the actions instead.
    readonly_fields = (
        "status",
        "customer",
        "store",
        "address",
        "subtotal",
        "delivery_price",
        "discount_amount",
        "promo_code",
        "delivery_method",
        "contact_name",
        "contact_phone",
        "delivery_slot",
        "total",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        ("Customer", {"fields": ("customer", "contact_name", "contact_phone")}),
        (
            "Delivery",
            {
                "fields": (
                    "delivery_method", "address", "delivery_slot", "courier_name", "courier_phone",
                )
            },
        ),
        ("Store", {"fields": ("store",)}),
        ("Status", {"fields": ("status", "note")}),
        (
            "Financials",
            {"fields": ("subtotal", "promo_code", "discount_amount", "delivery_price", "total")},
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    inlines = (OrderItemInline,)
    actions = (
        "mark_accepted",
        "mark_delivering",
        "mark_completed",
        "mark_cancelled",
        "export_csv",
    )

    @admin.display(description="Status")
    def status_badge(self, obj: Order) -> str:
        return render_status_badge(
            obj.status,
            ORDER_STATUS_COLORS,
            obj.get_status_display(),
        )

    def _run_transition(self, request, queryset, service, label: str, **kwargs):
        from apps.common.exceptions import ServiceError

        succeeded = 0
        for order in queryset:
            try:
                service.execute(order=order, **kwargs)
                succeeded += 1
            except ServiceError as exc:
                self.message_user(
                    request,
                    f"Order #{order.pk}: {exc}",
                    level="error",
                )
        if succeeded:
            self.message_user(request, f"{succeeded} order(s) marked {label}.")

    @admin.action(description="Mark selected orders ACCEPTED")
    def mark_accepted(self, request, queryset):
        from apps.orders.services import AcceptOrderService

        self._run_transition(request, queryset, AcceptOrderService, "accepted")

    @admin.action(description="Mark selected orders DELIVERING")
    def mark_delivering(self, request, queryset):
        from apps.orders.services import MarkDeliveringService

        self._run_transition(request, queryset, MarkDeliveringService, "delivering")

    @admin.action(description="Mark selected orders COMPLETED")
    def mark_completed(self, request, queryset):
        from apps.orders.services import CompleteOrderService

        self._run_transition(request, queryset, CompleteOrderService, "completed")


    @admin.action(description="Cancel selected orders (restocks items)")
    def mark_cancelled(self, request, queryset):
        from apps.orders.services import CancelOrderService

        self._run_transition(
            request, queryset, CancelOrderService, "cancelled", actor=request.user
        )


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    fields = ("product", "quantity")
    autocomplete_fields = ("product",)
    show_change_link = True


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    list_per_page = 50
    list_select_related = ("user",)

    list_display = ("user", "item_count", "created_at")
    search_fields = ("user__phone",)
    autocomplete_fields = ("user",)
    readonly_fields = ("created_at", "updated_at")

    inlines = (CartItemInline,)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .annotate(_item_count=Count("items", distinct=True))
        )

    @admin.display(description="Items", ordering="_item_count")
    def item_count(self, obj: Cart) -> int:
        return getattr(obj, "_item_count", obj.items.count())


@admin.register(PromoCode)
class PromoCodeAdmin(CsvExportMixin, admin.ModelAdmin):
    csv_fields = ("code", "kind", "value", "used_count", "max_uses", "is_active", "valid_until")
    list_display = (
        "code", "kind", "value", "store", "used_count", "max_uses", "is_active", "valid_until",
    )
    list_filter = ("kind", "is_active")
    search_fields = ("code",)
    raw_id_fields = ("store",)
    readonly_fields = ("used_count", "created_at", "updated_at")


@admin.register(ReturnRequest)
class ReturnRequestAdmin(admin.ModelAdmin):
    list_display = ("order", "status", "reason_short", "created_at")
    list_filter = ("status",)
    raw_id_fields = ("order",)
    readonly_fields = ("created_at", "updated_at")

    @admin.display(description="Reason")
    def reason_short(self, obj):
        return obj.reason[:60]
