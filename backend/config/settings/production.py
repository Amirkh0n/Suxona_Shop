"""Production settings."""

import os

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403

DEBUG = False

# Fail the deploy loudly instead of running with a guessable signing key.
if SECRET_KEY in ("", "change-me", "change-me-in-environment"):  # noqa: F405
    raise ImproperlyConfigured("Set DJANGO_SECRET_KEY to a long random value.")

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
