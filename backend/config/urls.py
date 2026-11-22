"""Root URL configuration for SuxonaShop."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path, re_path
from django.views.static import serve as serve_media
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from config.share import share_product, share_store
from config.views import home


def healthz(request):
    """Liveness + DB check for the platform's health probe (no auth, no redirect)."""
    from django.db import connection

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception:  # noqa: BLE001
        return JsonResponse({"status": "error"}, status=503)
    return JsonResponse({"status": "ok"})

admin.site.site_header = "SuxonaShop boshqaruv paneli"
admin.site.site_title = "SuxonaShop Admin"
admin.site.index_title = "Platforma boshqaruvi"

urlpatterns = [
    path("", home, name="home"),
    path("healthz", healthz, name="healthz"),
    path("share/products/<int:product_id>", share_product, name="share-product"),
    path("share/stores/<int:store_id>", share_store, name="share-store"),
    path(settings.ADMIN_URL, admin.site.urls),
    path("api/v1/", include("apps.accounts.urls")),
    path("api/v1/", include("apps.stores.urls")),
    path("api/v1/", include("apps.products.urls")),
    path("api/v1/", include("apps.orders.urls")),
    path("api/v1/", include("apps.notifications.urls")),
    path("api/v1/banners/", include("apps.banners.urls")),
    # API schema & documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )

if getattr(settings, "SERVE_MEDIA", False):
    urlpatterns += [
        re_path(
            rf"^{settings.MEDIA_URL.lstrip('/')}(?P<path>.*)$",
            serve_media,
            {"document_root": settings.MEDIA_ROOT},
        )
    ]
