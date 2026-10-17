"""Base Django settings for SuxonaShop."""

import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BASE_DIR / ".env")


SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "change-me-in-environment")
DEBUG = os.environ.get("DJANGO_DEBUG", "false").lower() == "true"
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

DJANGO_APPS = [
    # Admin theme (must come before django.contrib.admin). Colours/logo/title
    # are editable at runtime under Admin -> Admin Interface -> Themes.
    "admin_interface",
    "colorfield",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "django_filters",
    "drf_spectacular",
    "corsheaders",
]

LOCAL_APPS = [
    "apps.accounts",
    "apps.stores",
    "apps.products",
    "apps.orders",
    "apps.banners",
    "apps.notifications",
    "apps.common",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    # Serves collected static files (admin CSS/JS) directly from gunicorn.
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# CORS: auth is a Bearer JWT (not cookies), so cross-origin access only needs
# an explicit origin allow-list. Set DJANGO_CORS_ALLOWED_ORIGINS to a
# comma-separated list (e.g. https://shop.example.com). If it is unset we fall
# back to allow-all ONLY when DEBUG is on, so a forgotten env var in
# production fails closed instead of exposing the API to every origin.
_cors_origins = [
    o.strip()
    for o in os.environ.get("DJANGO_CORS_ALLOWED_ORIGINS", "").split(",")
    if o.strip()
]
CORS_ALLOWED_ORIGINS = _cors_origins
CORS_ALLOW_ALL_ORIGINS = not _cors_origins and DEBUG
CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB", "suxonashop"),
        "USER": os.environ.get("POSTGRES_USER", "suxonashop"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "suxonashop"),
        "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Tashkent"
USE_I18N = True
USE_TZ = True

# django-admin-interface renders theme previews in iframes.
X_FRAME_OPTIONS = "SAMEORIGIN"
SILENCED_SYSTEM_CHECKS = ["security.W019"]

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

# Media storage: Cloudflare R2 (S3-compatible) when CLOUDFLARE_R2_BUCKET_NAME
# is set, otherwise local disk. Local disk is fine for development but is
# ephemeral/non-shared on most hosts, so production should use R2.
# CLOUDFLARE_R2_PUBLIC_URL (custom domain / r2.dev URL) is what clients get
# back for uploaded files; the frontend's VITE_IMAGE_BASE_URL should match it.
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
if os.environ.get("CLOUDFLARE_R2_BUCKET_NAME"):
    STORAGES["default"] = {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {
            "bucket_name": os.environ["CLOUDFLARE_R2_BUCKET_NAME"],
            "access_key": os.environ.get("CLOUDFLARE_R2_ACCESS_KEY_ID", ""),
            "secret_key": os.environ.get("CLOUDFLARE_R2_SECRET_ACCESS_KEY", ""),
            "endpoint_url": os.environ.get("CLOUDFLARE_R2_ENDPOINT_URL", ""),
            "custom_domain": os.environ.get("CLOUDFLARE_R2_PUBLIC_URL", "") or None,
            "region_name": "auto",
            "signature_version": "s3v4",
            "default_acl": None,
            "querystring_auth": False,
            "file_overwrite": False,
        },
    }

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # Rate limiting (previously none). Per-client limits; tighten/loosen via
    # these rates. "auth" is applied to login/register/verify endpoints, the
    # obvious brute-force and SMS/Telegram-spam targets.
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "anon": os.environ.get("THROTTLE_ANON", "120/min"),
        "user": os.environ.get("THROTTLE_USER", "600/min"),
        "auth": os.environ.get("THROTTLE_AUTH", "10/min"),
    },
}

SPECTACULAR_SETTINGS = {
    "TITLE": "SuxonaShop API",
    "DESCRIPTION": "Marketplace API for SuxonaShop",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SORT_OPERATIONS": True,
    "SORT_OPERATION_PARAMETERS": True,
    "SCHEMA_PATH_PREFIX": "/api/v1",
    "SWAGGER_UI_SETTINGS": {
        "persistAuthorization": True,
    },
    # Disambiguate the several models that each expose a `status` choice field
    # so enum component names don't collide.
    "ENUM_NAME_OVERRIDES": {
        "OrderStatusEnum": "apps.common.enums.order_status.OrderStatus",
        "ProductStatusEnum": "apps.common.enums.product_status.ProductStatus",
        "StoreStatusEnum": "apps.common.enums.store_status.StoreStatus",
        "StoreApplicationStatusEnum": (
            "apps.common.enums.store_application_status.StoreApplicationStatus"
        ),
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# --- Telegram bot / verification -----------------------------------------
TELEGRAM_BOT_USERNAME = os.environ.get("TELEGRAM_BOT_USERNAME", "SuxonaShopBot")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
# Shared secret expected in the X-Telegram-Bot-Api-Secret-Token header on the
# verification webhook. Leave blank to disable the header check (dev only).
TELEGRAM_WEBHOOK_SECRET = os.environ.get("TELEGRAM_WEBHOOK_SECRET", "")
# Optional: a Telegram chat/group id the bot also posts to whenever a new
# store application comes in, so admins don't have to poll the admin site.
# Leave blank to skip the admin-side notification.
TELEGRAM_ADMIN_CHAT_ID = os.environ.get("TELEGRAM_ADMIN_CHAT_ID", "")

# --- Logging ---------------------------------------------------------------
# No logging config existed before; without one, errors from best-effort
# integrations (like a Telegram API call failing) vanish silently instead of
# showing up anywhere an operator would look.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {"format": "[{levelname}] {asctime} {name}: {message}", "style": "{"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "simple"},
    },
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "django": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
}
