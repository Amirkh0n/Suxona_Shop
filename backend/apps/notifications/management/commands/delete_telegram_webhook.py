from django.core.management.base import BaseCommand, CommandError

from apps.notifications.telegram import client


class Command(BaseCommand):
    help = "Remove the Telegram webhook (the bot stops receiving updates)."

    def add_arguments(self, parser):
        parser.add_argument("--drop-pending", action="store_true")

    def handle(self, *args, **options):
        try:
            client.delete_webhook(drop_pending_updates=options["drop_pending"])
        except (client.TelegramNotConfigured, RuntimeError) as exc:
            raise CommandError(str(exc)) from exc
        self.stdout.write(self.style.SUCCESS("Webhook deleted."))
