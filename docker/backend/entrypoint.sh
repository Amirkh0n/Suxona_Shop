#!/bin/sh
# Container start-up: prepare the database, then run the web server.
set -e

echo "==> migrate"
python manage.py migrate --noinput
python manage.py createcachetable

echo "==> staff roles"
python manage.py setup_admin_roles

# Optional: point the Telegram webhook at this deployment. Never blocks start-up.
if [ "${SET_TELEGRAM_WEBHOOK:-false}" = "true" ]; then
  echo "==> telegram webhook"
  python manage.py set_telegram_webhook || echo "(webhook setup failed; continuing)"
fi

# Render sets PORT; WEB_CONCURRENCY defaults low so a 512 MB instance does not run out of memory.
echo "==> gunicorn on port ${PORT:-8000}"
exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-2}" \
  --timeout "${GUNICORN_TIMEOUT:-60}" \
  --access-logfile - --error-logfile -
