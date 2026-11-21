from django.apps import AppConfig


class ProductsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.products"
    verbose_name = "Mahsulotlar"

    def ready(self) -> None:
        from . import signals  # noqa: F401
