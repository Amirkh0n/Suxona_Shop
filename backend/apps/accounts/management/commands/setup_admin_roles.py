"""Create/refresh the admin staff groups. Idempotent: safe to run on every deploy.

    python manage.py setup_admin_roles

Add a staff member to a group in Admin → Foydalanuvchilar → Groups.
"""

from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand

# role -> {app_label.model: actions}. "view" is implied by any other action.
ROLES: dict[str, dict[str, tuple[str, ...]]] = {
    # Reviews applications and products, handles abusive reviews.
    "Moderator": {
        "stores.storeapplication": ("view", "change"),
        "stores.store": ("view",),
        "products.product": ("view", "change"),
        "products.productimage": ("view",),
        "products.productvariant": ("view",),
        "products.productreview": ("view", "change"),
        "stores.storereview": ("view", "change"),
        "products.category": ("view",),
    },
    # Answers customers: orders, returns, users (no deleting, no money settings).
    "Support": {
        "orders.order": ("view", "change"),
        "orders.orderitem": ("view",),
        "orders.returnrequest": ("view", "change"),
        "accounts.user": ("view",),
        "accounts.address": ("view",),
        "stores.store": ("view",),
        "notifications.notification": ("view",),
    },
    # Runs content and promotions.
    "Marketing": {
        "banners.banner": ("view", "add", "change", "delete"),
        "orders.promocode": ("view", "add", "change", "delete"),
        "products.category": ("view", "add", "change"),
        "products.product": ("view",),
    },
    # Read-only across the platform, including the audit journal.
    "Auditor": {
        "*": ("view",),
    },
}


def _perms(spec: dict[str, tuple[str, ...]]) -> list[Permission]:
    found: list[Permission] = []
    for target, actions in spec.items():
        for action in set(actions) | {"view"}:
            if target == "*":
                found += list(Permission.objects.filter(codename__startswith="view_"))
                break
            app, model = target.split(".")
            found += list(
                Permission.objects.filter(
                    content_type__app_label=app,
                    content_type__model=model,
                    codename=f"{action}_{model}",
                )
            )
    return found


class Command(BaseCommand):
    help = "Create or update the Moderator / Support / Marketing / Auditor admin groups."

    def handle(self, *args, **options):
        for name, spec in ROLES.items():
            group, created = Group.objects.get_or_create(name=name)
            perms = _perms(spec)
            group.permissions.set(perms)
            self.stdout.write(
                f"{'Created' if created else 'Updated'} group {name!r} ({len(perms)} permissions)"
            )
