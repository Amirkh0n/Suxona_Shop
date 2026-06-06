import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

import apps.accounts.models.verification


def activate_existing_users(apps, schema_editor):
    """All users that exist before this migration predate Telegram
    verification and must remain able to log in."""
    User = apps.get_model("accounts", "User")
    User.objects.update(is_active=True)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="VerificationToken",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "token",
                    models.CharField(
                        default=apps.accounts.models.verification.generate_verification_token,
                        max_length=64,
                        unique=True,
                    ),
                ),
                (
                    "expires_at",
                    models.DateTimeField(
                        default=apps.accounts.models.verification.default_token_expiry,
                    ),
                ),
                ("consumed_at", models.DateTimeField(blank=True, null=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="verification_token",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.AddIndex(
            model_name="verificationtoken",
            index=models.Index(fields=["token"], name="verification_token_idx"),
        ),
        migrations.AddIndex(
            model_name="verificationtoken",
            index=models.Index(fields=["user"], name="verification_user_idx"),
        ),
        migrations.RunPython(activate_existing_users, noop_reverse),
    ]
