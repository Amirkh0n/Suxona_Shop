from __future__ import annotations

from django.contrib import admin

from apps.banners.models import Banner
from apps.common.admin import (
    render_bool_badge,
    render_image_preview,
    render_thumbnail,
)


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    ordering = ("sort_order", "-created_at")
    list_per_page = 50

    list_display = ("title", "thumbnail", "active_badge", "sort_order")
    list_editable = ("sort_order",)
    list_filter = ("is_active",)
    search_fields = ("title",)
    readonly_fields = ("created_at", "updated_at", "image_preview")

    fieldsets = (
        (None, {"fields": ("title", "url", "is_active", "sort_order")}),
        ("Media", {"fields": ("image", "image_preview")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    actions = ("activate_banners", "deactivate_banners")

    @admin.display(description="Preview")
    def thumbnail(self, obj: Banner) -> str:
        return render_thumbnail(obj.image, height=40)

    @admin.display(description="Image")
    def image_preview(self, obj: Banner) -> str:
        return render_image_preview(obj.image)

    @admin.display(description="Active")
    def active_badge(self, obj: Banner) -> str:
        return render_bool_badge(obj.is_active)

    @admin.action(description="Activate selected banners")
    def activate_banners(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} banner(s) activated.")

    @admin.action(description="Deactivate selected banners")
    def deactivate_banners(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} banner(s) deactivated.")
