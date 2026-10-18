from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.notifications.telegram import client


class Command(BaseCommand):
    help = (
        "Register the Telegram webhook (and the bot's command menu). "
        "Run once after deploy, and again whenever the public URL or "
        "TELEGRAM_WEBHOOK_SECRET changes."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--url",
            help="Full webhook URL. Default: SITE_BASE_URL + /api/v1/telegram/webhook",
        )
        parser.add_argument("--drop-pending", action="store_true")

    def handle(self, *args, **options):
        if not settings.TELEGRAM_WEBHOOK_SECRET:
            raise CommandError("TELEGRAM_WEBHOOK_SECRET must be set (it authenticates Telegram).")
        url = options["url"] or f"{settings.SITE_BASE_URL}/api/v1/telegram/webhook"
        if not url.startswith("https://"):
            raise CommandError(
                f"Telegram only delivers webhooks to https:// URLs (got {url}). "
                "Set SITE_BASE_URL to your public https domain, or use a tunnel "
                "(e.g. ngrok) in development."
            )
        try:
            client.set_webhook(
                url,
                secret_token=settings.TELEGRAM_WEBHOOK_SECRET,
                drop_pending_updates=options["drop_pending"],
            )
            client.set_my_commands([{"command": "start", "description": "Boshlash"}])
        except (client.TelegramNotConfigured, RuntimeError) as exc:
            raise CommandError(str(exc)) from exc
        self.stdout.write(self.style.SUCCESS(f"Webhook set: {url}"))
