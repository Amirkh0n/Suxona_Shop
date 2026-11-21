"""Detect stock/price changes on Product saves and fire the matching alerts."""

from decimal import Decimal

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.notifications.telegram.services import after_commit
from apps.products.models import Product
from apps.products.services import alerts


@receiver(pre_save, sender=Product)
def remember_previous(sender, instance: Product, **kwargs) -> None:
    prev = (
        Product.objects.filter(pk=instance.pk).values("stock", "price", "status").first()
        if instance.pk
        else None
    )
    instance._prev = prev


@receiver(post_save, sender=Product)
def fire_alerts(sender, instance: Product, created: bool, **kwargs) -> None:
    prev = getattr(instance, "_prev", None)
    if created or prev is None:
        return
    after_commit(alerts.fire_back_in_stock, product_id=instance.pk)
    if Decimal(str(instance.price)) < prev["price"]:
        after_commit(alerts.fire_price_drop, product_id=instance.pk, old_price=prev["price"])
    old, new = prev["stock"], instance.stock
    threshold = instance.low_stock_threshold
    if new is not None and new <= threshold and (old is None or old > threshold):
        after_commit(alerts.fire_low_stock, product_id=instance.pk)
