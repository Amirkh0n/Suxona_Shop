"""Local development settings."""

from .base import *  # noqa: F403

DEBUG = True

# Local dev: no origin allow-list configured -> allow any origin for convenience.
CORS_ALLOW_ALL_ORIGINS = not CORS_ALLOWED_ORIGINS  # noqa: F405
