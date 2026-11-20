import os
import subprocess
import sys

import pytest


def test_healthz_reports_ok(client, db):
    r = client.get("/healthz")
    assert r.status_code == 200 and r.json() == {"status": "ok"}


def _settings(env: dict[str, str], expr: str) -> str:
    """Evaluate ``expr`` in a fresh interpreter with the given environment."""
    clean = {
        k: v
        for k, v in os.environ.items()
        if not k.startswith(("DJANGO_", "DATABASE_", "POSTGRES_"))
    }
    code = f"import django;from django.conf import settings;print({expr})"
    out = subprocess.run(
        [sys.executable, "-c", code],
        env={**clean, "PYTHONPATH": ".", **env},
        capture_output=True,
        text=True,
    )
    return out.stdout.strip() or out.stderr.strip().splitlines()[-1]


def test_database_url_selects_postgres():
    env = {
        "DJANGO_SETTINGS_MODULE": "config.settings.local",
        "DATABASE_URL": "postgres://u:p@db.example.com:5433/shop",
    }
    got = _settings(
        env,
        "settings.DATABASES['default']['ENGINE'], "
        "settings.DATABASES['default']['HOST'], settings.DATABASES['default']['PORT']",
    )
    assert got == "django.db.backends.postgresql db.example.com 5433"


def test_sqlite_is_the_fallback():
    got = _settings(
        {"DJANGO_SETTINGS_MODULE": "config.settings.local"},
        "settings.DATABASES['default']['ENGINE']",
    )
    assert got.endswith("sqlite3")


def test_render_hostname_is_trusted():
    env = {
        "DJANGO_SETTINGS_MODULE": "config.settings.local",
        "RENDER_EXTERNAL_HOSTNAME": "api.onrender.com",
    }
    got = _settings(
        env,
        "'api.onrender.com' in settings.ALLOWED_HOSTS,"
        "'https://api.onrender.com' in settings.CSRF_TRUSTED_ORIGINS",
    )
    assert got == "True True"


@pytest.mark.parametrize(
    "env,message",
    [
        ({}, "DJANGO_SECRET_KEY"),
        ({"DJANGO_SECRET_KEY": "x" * 50}, "DJANGO_CORS_ALLOWED_ORIGINS"),
    ],
)
def test_production_refuses_unsafe_config(env, message):
    got = _settings(
        {"DJANGO_SETTINGS_MODULE": "config.settings.production", **env}, "settings.DEBUG"
    )
    assert message in got


def test_production_boots_with_required_config():
    env = {
        "DJANGO_SETTINGS_MODULE": "config.settings.production",
        "DJANGO_SECRET_KEY": "x" * 50,
        "DJANGO_CORS_ALLOWED_ORIGINS": "https://shop.pages.dev",
    }
    got = _settings(
        env, "settings.DEBUG, settings.SECURE_SSL_REDIRECT, settings.CORS_ALLOWED_ORIGINS"
    )
    assert got == "False True ['https://shop.pages.dev']"
