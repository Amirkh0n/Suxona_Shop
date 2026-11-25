"""Production settings."""

import os

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403

DEBUG = False

# Fail the deploy loudly instead of running with a guessable signing key.
if SECRET_KEY in ("", "change-me", "change-me-in-environment") or len(SECRET_KEY) < 32:  # noqa: F405
    raise ImproperlyConfigured("Set DJANGO_SECRET_KEY to a random value of 32+ characters.")

# The platform terminates TLS and forwards the original scheme.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = os.environ.get("DJANGO_SSL_REDIRECT", "true").lower() == "true"
# Health checks hit the service directly; never redirect them.
SECURE_REDIRECT_EXEMPT = [r"^healthz$"]
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
# HSTS is opt-in: once sent, browsers refuse plain http for the whole period.
SECURE_HSTS_SECONDS = int(os.environ.get("DJANGO_HSTS_SECONDS", "0"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = SECURE_HSTS_SECONDS > 0
SECURE_CONTENT_TYPE_NOSNIFF = True

# The SPA lives on another origin (Cloudflare), so the API must be told who may call it.
if not CORS_ALLOWED_ORIGINS:  # noqa: F405
    raise ImproperlyConfigured(
        "Set DJANGO_CORS_ALLOWED_ORIGINS to the frontend origin, e.g. https://shop.pages.dev"
    )

# Hashed + compressed static files (needs `collectstatic`, done in the Docker
# build). Not used in local/dev so `runserver` and tests work without it.
STORAGES = {
    **STORAGES,  # noqa: F405
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

# Without R2, uploaded media lives on local disk. Serve it from Django only when a
# persistent disk is mounted and this is explicitly enabled (see docs/DEPLOY_RENDER.md).
SERVE_MEDIA = os.environ.get("DJANGO_SERVE_MEDIA", "false").lower() == "true"

# --- Request hardening ----------------------------------------------------------
# Behind N trusted proxies (Render's load balancer = 1; add Cloudflare in front = 2).
# DRF's throttling reads the client IP from X-Forwarded-For; without this number a
# caller could rotate a fake header value and never hit a rate limit.
REST_FRAMEWORK = {  # noqa: F405
    **REST_FRAMEWORK,  # noqa: F405
    "NUM_PROXIES": int(os.environ.get("DJANGO_NUM_PROXIES", "1")),
    # JSON only: no browsable API / HTML forms on the public service.
    "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",),
}
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "same-origin"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

# Rate limits and login lock-outs live in the cache. Per-process memory would give
# every gunicorn worker its own counters, so share them. DJANGO_CACHE_BACKEND:
#   db     (default) shared DB table; needs `python manage.py createcachetable`
#   file   shared files in DJANGO_CACHE_DIR; no setup (single-host setups, PythonAnywhere)
#   locmem per-process memory (counters are per worker; fine for one-worker hosts)
# REDIS_URL, when set, wins over all of these (configured in base.py).
if not os.environ.get("REDIS_URL"):
    _cache = os.environ.get("DJANGO_CACHE_BACKEND", "db").lower()
    if _cache == "file":
        CACHES = {
            "default": {
                "BACKEND": "django.core.cache.backends.filebased.FileBasedCache",
                "LOCATION": os.environ.get("DJANGO_CACHE_DIR", "/tmp/suxonashop_cache"),
            }
        }
    elif _cache == "locmem":
        CACHES = {
            "default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}
        }
    else:
        CACHES = {
            "default": {
                "BACKEND": "django.core.cache.backends.db.DatabaseCache",
                "LOCATION": "django_cache",
            }
        }

# A missing/stale collectstatic manifest must not turn admin and Swagger pages into 500s.
WHITENOISE_MANIFEST_STRICT = False
