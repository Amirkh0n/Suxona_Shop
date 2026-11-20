from __future__ import annotations

from django.contrib import admin, messages
from django.db.models import Count
from django.http import HttpResponseRedirect
from django.utils.html import format_html

from apps.common.admin import (
    PRODUCT_STATUS_COLORS,
    render_bool_badge,
    render_image_preview,
    render_status_badge,
    render_thumbnail,
)
from apps.common.audit import record
from apps.common.enums import ProductStatus
from apps.products.models import (
    Category,
    Favorite,
    Product,
    ProductImage,
    ProductReview,
    ProductVariant,
)
from apps.products.services import refresh_product_rating


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


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = ("sku", "attributes", "price", "stock", "is_active")
    ordering = ("sku",)


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ("sku", "product", "price", "stock", "is_active")
    list_filter = ("is_active",)
    search_fields = ("sku", "product__name")
    autocomplete_fields = ("product",)


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
        "price_display",
        "stock",
        "rating_display",
        "status_badge",
        "image_count",
        "created_at",
    )
    list_display_links = ("name",)

    @admin.display(description="Narx", ordering="price")
    def price_display(self, obj):
        if obj.discount_percent:
            return format_html(
                "{} <s class='text-muted'>{}</s> <b class='text-danger'>-{}%</b>",
                obj.price,
                obj.old_price,
                obj.discount_percent,
            )
        return obj.price

    @admin.display(description="Reyting", ordering="rating_avg")
    def rating_display(self, obj):
        return f"★ {obj.rating_avg} ({obj.rating_count})" if obj.rating_count else "—"
    list_filter = ("status", "category", "store")
    search_fields = ("name", "store__name")
    autocomplete_fields = ("store", "category")
    change_form_template = "admin/products/product/change_form.html"
    # Status and review fields change only through the moderation services /
    # actions, so approvals are audited and the seller is notified.
    readonly_fields = (
        "status",
        "approved_at",
        "reviewed_by",
        "reviewed_at",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (None, {"fields": ("store", "category", "name", "description")}),
        ("Pricing & stock", {"fields": ("price", "old_price", "stock", "status")}),
        (
            "Moderation",
            {"fields": ("moderation_note", "approved_at", "reviewed_by", "reviewed_at")},
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    inlines = (ProductImageInline, ProductVariantInline)
    actions = ("approve_products", "reject_products", "archive_products")

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

    # -- moderation ---------------------------------------------------------
    def response_change(self, request, obj):
        if "_approve" in request.POST:
            self._moderate(request, obj, approve=True)
            return HttpResponseRedirect(request.path)
        if "_reject" in request.POST:
            # obj already carries the note typed into the form.
            self._moderate(request, obj, approve=False, note=obj.moderation_note)
            return HttpResponseRedirect(request.path)
        return super().response_change(request, obj)

    def _moderate(self, request, product, *, approve: bool, note: str = "") -> bool:
        from apps.common.exceptions import ServiceError
        from apps.products.services import ApproveProductService, RejectProductService

        try:
            if approve:
                ApproveProductService.execute(product=product, reviewed_by=request.user)
            else:
                RejectProductService.execute(
                    product=product, note=note, reviewed_by=request.user
                )
        except ServiceError as exc:
            self.message_user(request, f"{product.name}: {exc}", level=messages.ERROR)
            return False
        verb = "tasdiqlandi" if approve else "rad etildi"
        self.message_user(request, f"«{product.name}» {verb}.")
        return True

    @admin.action(description="Approve selected products (pending review)")
    def approve_products(self, request, queryset):
        for product in queryset:
            self._moderate(request, product, approve=True)

    @admin.action(description="Reject selected products (no reason given)")
    def reject_products(self, request, queryset):
        for product in queryset:
            self._moderate(request, product, approve=False)

    @admin.action(description="Archive (hide) selected products")
    def archive_products(self, request, queryset):
        updated = queryset.update(status=ProductStatus.HIDDEN)
        self.message_user(request, f"{updated} product(s) archived.")


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "customer", "rating", "is_hidden", "created_at")
    list_filter = ("is_hidden", "rating")
    search_fields = ("product__name", "comment", "customer__phone")
    raw_id_fields = ("product", "customer")
    readonly_fields = ("created_at", "updated_at")
    actions = ["hide_reviews", "show_reviews"]

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        refresh_product_rating(obj.product_id)

    def _toggle(self, request, queryset, hidden: bool):
        product_ids = set(queryset.values_list("product_id", flat=True))
        first = queryset.first()
        count = queryset.count()
        queryset.update(is_hidden=hidden)
        if first is not None:
            record(
                request.user,
                "review.hide" if hidden else "review.show",
                first,
                f"{count} review(s) on {len(product_ids)} product(s)",
            )
        for pid in product_ids:
            refresh_product_rating(pid)
        self.message_user(request, f"{len(product_ids)} ta mahsulot reytingi yangilandi.")

    @admin.action(description="Tanlangan sharhlarni yashirish")
    def hide_reviews(self, request, queryset):
        self._toggle(request, queryset, True)

    @admin.action(description="Tanlangan sharhlarni ko'rsatish")
    def show_reviews(self, request, queryset):
        self._toggle(request, queryset, False)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "created_at")
    raw_id_fields = ("user", "product")
