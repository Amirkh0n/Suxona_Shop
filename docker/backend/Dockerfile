FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

WORKDIR /app/backend

COPY backend/pyproject.toml backend/.python-version ./
RUN uv sync --no-dev --no-install-project

COPY backend/ ./

# Collect static files at build time (admin CSS/JS) so WhiteNoise can serve them.
RUN DJANGO_SETTINGS_MODULE=config.settings.production \
    DJANGO_SECRET_KEY=build-only \
    uv run python manage.py collectstatic --noinput

# Don't run the app as root.
RUN useradd --create-home --uid 1000 app && chown -R app:app /app
USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD uv run python -c "import urllib.request;urllib.request.urlopen('http://127.0.0.1:8000/api/schema/')" || exit 1

CMD ["uv", "run", "gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
