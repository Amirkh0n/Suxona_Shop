from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.orders.models import IdempotencyKey


class Command(BaseCommand):
    help = "Delete idempotency keys older than N hours (default 48). Run daily from cron."

    def add_arguments(self, parser):
        parser.add_argument("--hours", type=int, default=48)

    def handle(self, *args, **opts):
        cutoff = timezone.now() - timedelta(hours=opts["hours"])
        deleted, _ = IdempotencyKey.objects.filter(created_at__lt=cutoff).delete()
        self.stdout.write(f"Deleted {deleted} idempotency key(s) older than {opts['hours']}h.")
