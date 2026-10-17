import logging
import time

from django.core.management.base import BaseCommand, CommandError

from apps.notifications.telegram import bot, client

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Run the SuxonaShop Telegram bot using long polling."

    def handle(self, *args, **options):
        try:
            client._token()
        except client.TelegramNotConfigured as exc:
            raise CommandError(str(exc)) from exc

        client.set_my_commands([{"command": "start", "description": "Boshlash"}])
        self.stdout.write(
            self.style.SUCCESS("Telegram bot started (long polling). Ctrl+C to stop.")
        )

        offset = None
        while True:
            try:
                updates = client.get_updates(offset=offset, timeout=30)
            except KeyboardInterrupt:
                raise
            except Exception:  # noqa: BLE001 - network blips must not kill the bot
                logger.exception("getUpdates failed; retrying in 5s")
                time.sleep(5)
                continue

            for update in updates:
                offset = update["update_id"] + 1
                try:
                    bot.handle_update(update)
                except Exception:  # noqa: BLE001
                    logger.exception("Failed handling update %s", update.get("update_id"))
