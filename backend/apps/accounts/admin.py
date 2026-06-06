from __future__ import annotations

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.translation import gettext_lazy as _

from apps.accounts.models import Address, TelegramAccount, User
from apps.common.admin import render_badge


class AddressInline(admin.TabularInline):
    model = Address
    extra = 0
    fields = ("village", "street", "house", "landmark", "is_default")
    autocomplete_fields = ("village",)
    show_change_link = True


class TelegramAccountInline(admin.StackedInline):
    model = TelegramAccount
    extra = 0
    fields = ("telegram_id", "username", "linked_at")
    readonly_fields = ("linked_at",)
    can_delete = True


class RoleListFilter(admin.SimpleListFilter):
    """Derived role filter (no role field exists on the model)."""

    title = _("role")
    parameter_name = "role"

    def lookups(self, request, model_admin):
        return (
            ("admin", _("Admin")),
            ("seller", _("Seller")),
            ("customer", _("Customer")),
        )

    def queryset(self, request, queryset):
        value = self.value()
        if value == "admin":
            return queryset.filter(is_staff=True)
        if value == "seller":
            return queryset.filter(store__isnull=False)
        if value == "customer":
            return queryset.filter(is_staff=False, store__isnull=True)
        return queryset


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    list_per_page = 50

    list_display = (
        "phone",
        "first_name",
        "last_name",
        "role_badge",
        "is_active",
        "created_at",
    )
    list_filter = (RoleListFilter, "is_active", "is_staff")
    search_fields = ("phone", "first_name", "last_name")
    readonly_fields = ("created_at", "updated_at", "last_login")

    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "phone",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "is_active",
                ),
            },
        ),
    )

    inlines = (AddressInline, TelegramAccountInline)
    actions = ("activate_users", "deactivate_users")

    def get_queryset(self, request):
        # select_related the reverse OneToOne store to avoid N+1 in role_badge.
        return super().get_queryset(request).select_related("store")

    @admin.display(description="Role")
    def role_badge(self, obj: User) -> str:
        if obj.is_superuser or obj.is_staff:
            return render_badge("Admin", "#ef4444")
        # store is a reverse OneToOne; guard against missing relation.
        if getattr(obj, "store", None) is not None:
            return render_badge("Seller", "#3b82f6")
        return render_badge("Customer", "#6b7280")

    @admin.action(description="Activate selected users")
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} user(s) activated.")

    @admin.action(description="Deactivate selected users")
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} user(s) deactivated.")
