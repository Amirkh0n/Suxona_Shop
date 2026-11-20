FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    PATH="/opt/venv/bin:$PATH" \
    DJANGO_SETTINGS_MODULE=config.settings.production

WORKDIR /app/backend

# Dependencies first: this layer is cached until pyproject.toml changes.
COPY backend/pyproject.toml backend/.python-version ./
RUN uv sync --no-dev --no-install-project

COPY backend/ ./

# Collect static files at build time (admin CSS/JS) so WhiteNoise can serve them.
# The build-only values satisfy the production settings checks; they are not kept.
RUN DJANGO_SECRET_KEY=build-only DJANGO_CORS_ALLOWED_ORIGINS=https://build.invalid \
    python manage.py collectstatic --noinput

COPY docker/backend/entrypoint.sh /entrypoint.sh

# Don't run the app as root. Media dir is writable for local-disk uploads (no R2).
RUN useradd --create-home --uid 1000 app \
    && mkdir -p /data/media \
    && chown -R app:app /app /data
USER app

ENV PORT=8000
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD python -c "import os,urllib.request;urllib.request.urlopen('http://127.0.0.1:'+os.environ.get('PORT','8000')+'/healthz')" || exit 1

CMD ["/entrypoint.sh"]
