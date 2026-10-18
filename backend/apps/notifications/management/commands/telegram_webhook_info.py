import json

from django.core.management.base import BaseCommand, CommandError

from apps.notifications.telegram import client


class Command(BaseCommand):
    help = "Show the webhook Telegram currently has on record (url, pending updates, last error)."

    def handle(self, *args, **options):
        try:
            info = client.get_webhook_info()
        except (client.TelegramNotConfigured, RuntimeError) as exc:
            raise CommandError(str(exc)) from exc
        self.stdout.write(json.dumps(info, indent=2, ensure_ascii=False))
