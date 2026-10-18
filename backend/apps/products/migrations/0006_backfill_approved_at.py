from django.db import migrations
from django.db.models import F


def backfill(apps, schema_editor):
    """Products that were already live before moderation existed count as approved,
    otherwise sellers could not re-activate their own existing products."""
    Product = apps.get_model("products", "Product")
    Product.objects.exclude(status="DRAFT").filter(approved_at__isnull=True).update(
        approved_at=F("updated_at")
    )


class Migration(migrations.Migration):
    dependencies = [("products", "0005_product_moderation")]
    operations = [migrations.RunPython(backfill, migrations.RunPython.noop)]
