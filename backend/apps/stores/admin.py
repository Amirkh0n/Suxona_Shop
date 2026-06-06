from __future__ import annotations

from django.contrib import admin

from apps.common.admin import (
    STORE_APPLICATION_STATUS_COLORS,
    STORE_STATUS_COLORS,
    render_bool_badge,
    render_image_preview,
    render_status_badge,
)
from apps.common.enums import StoreApplicationStatus, StoreStatus
from apps.stores.models import DeliveryZone, Store, StoreApplication, Village


class DeliveryZoneInline(admin.TabularInline):
    model = DeliveryZone
    extra = 0
    fields = ("village", "delivery_price", "is_active")
    autocomplete_fields = ("village",)
    show_change_link = True


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    list_per_page = 50
    list_select_related = ("owner",)

    list_display = (
        "name",
        "owner",
        "status_badge",
        "phone",
        "telegram_username",
        "created_at",
    )
    list_filter = ("status",)
    search_fields = ("name", "owner__phone", "owner__first_name", "owner__last_name")
    autocomplete_fields = ("owner",)
    readonly_fields = ("created_at", "updated_at", "logo_preview", "banner_preview")

    fieldsets = (
        (None, {"fields": ("owner", "name", "description", "status")}),
        ("Contact", {"fields": ("phone", "telegram_username")}),
        ("Media", {"fields": ("logo", "logo_preview", "banner", "banner_preview")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    inlines = (DeliveryZoneInline,)
    actions = ("activate_stores", "suspend_stores")

    @admin.display(description="Status")
    def status_badge(self, obj: Store) -> str:
        return render_status_badge(obj.status, STORE_STATUS_COLORS, obj.get_status_display())

    @admin.display(description="Logo")
    def logo_preview(self, obj: Store) -> str:
        return render_image_preview(obj.logo)

    @admin.display(description="Banner")
    def banner_preview(self, obj: Store) -> str:
        return render_image_preview(obj.banner)

    @admin.action(description="Activate selected stores")
    def activate_stores(self, request, queryset):
        updated = queryset.update(status=StoreStatus.ACTIVE)
        self.message_user(request, f"{updated} store(s) activated.")

    @admin.action(description="Suspend selected stores")
    def suspend_stores(self, request, queryset):
        updated = queryset.update(status=StoreStatus.SUSPENDED)
        self.message_user(request, f"{updated} store(s) suspended.")


@admin.register(StoreApplication)
class StoreApplicationAdmin(admin.ModelAdmin):
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    list_per_page = 50
    list_select_related = ("owner",)

    list_display = (
        "store_name",
        "owner",
        "phone",
        "status_badge",
        "created_at",
    )
    list_filter = ("status",)
    search_fields = ("store_name", "owner__phone")
    autocomplete_fields = ("owner",)
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        (None, {"fields": ("owner", "store_name", "phone", "status")}),
        ("Review", {"fields": ("admin_note",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    actions = ("approve_applications", "reject_applications")

    @admin.display(description="Status")
    def status_badge(self, obj: StoreApplication) -> str:
        return render_status_badge(
            obj.status,
            STORE_APPLICATION_STATUS_COLORS,
            obj.get_status_display(),
        )

    @admin.action(description="Approve selected applications")
    def approve_applications(self, request, queryset):
        # Delegate to the domain service so the Store is created and all
        # business rules (race conditions, duplicate stores) are enforced.
        from apps.common.exceptions import ServiceError
        from apps.stores.services import ApproveStoreService

        pending = queryset.filter(status=StoreApplicationStatus.PENDING)
        skipped = queryset.count() - pending.count()

        approved = 0
        for application in pending:
            try:
                ApproveStoreService.execute(application=application)
                approved += 1
            except ServiceError as exc:
                self.message_user(
                    request,
                    f"{application.store_name}: {exc}",
                    level="error",
                )
        if approved:
            self.message_user(request, f"{approved} application(s) approved.")
        if skipped:
            self.message_user(
                request,
                f"{skipped} non-pending application(s) skipped.",
                level="warning",
            )

    @admin.action(description="Reject selected applications")
    def reject_applications(self, request, queryset):
        from apps.common.exceptions import ServiceError
        from apps.stores.services import RejectStoreService

        pending = queryset.filter(status=StoreApplicationStatus.PENDING)
        skipped = queryset.count() - pending.count()

        rejected = 0
        for application in pending:
            try:
                RejectStoreService.execute(application=application)
                rejected += 1
            except ServiceError as exc:
                self.message_user(
                    request,
                    f"{application.store_name}: {exc}",
                    level="error",
                )
        if rejected:
            self.message_user(request, f"{rejected} application(s) rejected.")
        if skipped:
            self.message_user(
                request,
                f"{skipped} non-pending application(s) skipped.",
                level="warning",
            )


@admin.register(Village)
class VillageAdmin(admin.ModelAdmin):
    ordering = ("district", "name")
    list_per_page = 100

    list_display = ("name", "district", "active_badge")
    list_filter = ("is_active", "district")
    search_fields = ("name", "district")
    readonly_fields = ("created_at", "updated_at")

    actions = ("activate_villages", "deactivate_villages")

    @admin.display(description="Active")
    def active_badge(self, obj: Village) -> str:
        return render_bool_badge(obj.is_active)

    @admin.action(description="Activate selected villages")
    def activate_villages(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} village(s) activated.")

    @admin.action(description="Deactivate selected villages")
    def deactivate_villages(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} village(s) deactivated.")
