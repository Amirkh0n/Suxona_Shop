from django.apps import AppConfig


class OrdersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.orders"
    verbose_name = "Buyurtmalar"

    def ready(self) -> None:
        from . import signals  # noqa: F401
