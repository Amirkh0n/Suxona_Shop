"""Jazzmin (AdminLTE) configuration for the SuxonaShop project admin.

Kept out of base.py so the admin's look/navigation can be tuned without
touching core settings.
"""

from django.urls import reverse_lazy  # noqa: F401  (documented for custom links below)

JAZZMIN_SETTINGS = {
    # -- branding --------------------------------------------------------------
    "site_title": "SuxonaShop Admin",
    "site_header": "SuxonaShop",
    "site_brand": "SuxonaShop",
    "site_logo": "admin/img/logo.png",
    "login_logo": "admin/img/logo.png",
    "site_logo_classes": "",
    "site_icon": "admin/img/favicon.png",
    "welcome_sign": "Boshqaruv paneliga xush kelibsiz",
    "copyright": "SuxonaShop",
    "custom_css": "admin/css/suxonashop.css",
    # -- global search (navbar) -------------------------------------------------
    "search_model": ["accounts.User", "orders.Order"],
    # -- top navbar -------------------------------------------------------------
    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index", "permissions": ["auth.view_user"]},
        {
            "name": "Arizalar",
            "url": "/admin/stores/storeapplication/?status__exact=PENDING",
            "permissions": ["stores.view_storeapplication"],
        },
        {
            "name": "Moderatsiya",
            "url": "/admin/products/product/?status__exact=PENDING_REVIEW",
            "permissions": ["products.view_product"],
        },
        {
            "name": "Buyurtmalar",
            "url": "/admin/orders/order/?status__exact=PENDING",
            "permissions": ["orders.view_order"],
        },
        {"name": "API", "url": "/api/docs/", "new_window": True},
    ],
    "usermenu_links": [
        {"name": "Saytga o'tish", "url": "/", "new_window": True, "icon": "fas fa-globe"},
    ],
    # -- sidebar ----------------------------------------------------------------
    "show_sidebar": True,
    "navigation_expanded": False,
    "order_with_respect_to": [
        "stores",
        "orders",
        "products",
        "accounts",
        "banners",
        "auth",
    ],
    "icons": {
        "auth": "fas fa-shield-alt",
        "auth.group": "fas fa-users-cog",
        "accounts": "fas fa-user-friends",
        "accounts.user": "fas fa-user",
        "stores": "fas fa-store",
        "stores.store": "fas fa-store-alt",
        "stores.storeapplication": "fas fa-file-signature",
        "stores.village": "fas fa-map-marker-alt",
        "products": "fas fa-boxes",
        "products.product": "fas fa-box-open",
        "products.category": "fas fa-sitemap",
        "products.productvariant": "fas fa-tags",
        "orders": "fas fa-receipt",
        "orders.order": "fas fa-shopping-bag",
        "orders.cart": "fas fa-shopping-cart",
        "banners": "fas fa-images",
        "banners.banner": "fas fa-image",
    },
    "default_icon_parents": "fas fa-folder",
    "default_icon_children": "far fa-circle",
    # -- forms ------------------------------------------------------------------
    "related_modal_active": True,  # add/edit related objects in a popup, no page jump
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "accounts.user": "collapsible",
        "stores.storeapplication": "single",
        "orders.order": "horizontal_tabs",
    },
    "show_ui_builder": False,
    "language_chooser": False,
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-success",
    "accent": "accent-success",
    "navbar": "navbar-white navbar-light",
    "no_navbar_border": True,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-success",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": True,
    "theme": "default",
    "default_theme_mode": "auto",  # follows the OS light/dark preference
    "button_classes": {
        "primary": "btn-success",
        "secondary": "btn-outline-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
}
