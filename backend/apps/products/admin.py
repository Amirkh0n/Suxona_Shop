from __future__ import annotations

from django.contrib import admin
from django.db.models import Count

from apps.common.admin import (
    PRODUCT_STATUS_COLORS,
    render_bool_badge,
    render_image_preview,
    render_status_badge,
    render_thumbnail,
)
from apps.common.enums import ProductStatus
from apps.products.models import Category, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    ordering = ("parent__name", "name")
    list_per_page = 100
    list_select_related = ("parent",)

    list_display = ("name", "parent", "active_badge")
    list_filter = ("is_active",)
    search_fields = ("name",)
    autocomplete_fields = ("parent",)
    readonly_fields = ("created_at", "updated_at", "icon_preview")

    fieldsets = (
        (None, {"fields": ("parent", "name", "is_active")}),
        ("Media", {"fields": ("icon", "icon_preview")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    @admin.display(description="Active")
    def active_badge(self, obj: Category) -> str:
        return render_bool_badge(obj.is_active)

    @admin.display(description="Icon")
    def icon_preview(self, obj: Category) -> str:
        return render_image_preview(obj.icon, max_height=120)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    fields = ("thumbnail", "image", "is_primary", "sort_order")
    readonly_fields = ("thumbnail",)
    ordering = ("sort_order",)

    @admin.display(description="Preview")
    def thumbnail(self, obj: ProductImage) -> str:
        return render_thumbnail(obj.image, height=48)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    list_per_page = 50
    list_select_related = ("store", "category")

    list_display = (
        "primary_thumbnail",
        "name",
        "store",
        "category",
        "price",
        "stock",
        "status_badge",
        "image_count",
        "created_at",
    )
    list_display_links = ("name",)
    list_filter = ("status", "category")
    search_fields = ("name", "store__name")
    autocomplete_fields = ("store", "category")
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        (None, {"fields": ("store", "category", "name", "description")}),
        ("Pricing & stock", {"fields": ("price", "stock", "status")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    inlines = (ProductImageInline,)
    actions = ("activate_products", "archive_products")

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .prefetch_related("images")
            .annotate(_image_count=Count("images", distinct=True))
        )

    @admin.display(description="")
    def primary_thumbnail(self, obj: Product) -> str:
        primary = next(
            (img for img in obj.images.all() if img.is_primary),
            None,
        )
        if primary is None:
            images = list(obj.images.all())
            primary = images[0] if images else None
        return render_thumbnail(primary.image if primary else None, height=40)

    @admin.display(description="Images", ordering="_image_count")
    def image_count(self, obj: Product) -> int:
        return getattr(obj, "_image_count", obj.images.count())

    @admin.display(description="Status")
    def status_badge(self, obj: Product) -> str:
        return render_status_badge(
            obj.status,
            PRODUCT_STATUS_COLORS,
            obj.get_status_display(),
        )

    @admin.action(description="Activate selected products")
    def activate_products(self, request, queryset):
        updated = queryset.update(status=ProductStatus.ACTIVE)
        self.message_user(request, f"{updated} product(s) activated.")

    @admin.action(description="Archive (hide) selected products")
    def archive_products(self, request, queryset):
        updated = queryset.update(status=ProductStatus.HIDDEN)
        self.message_user(request, f"{updated} product(s) archived.")
