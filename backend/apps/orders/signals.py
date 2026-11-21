"""Record every order status in OrderStatusEvent so customers get a timeline."""

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.orders.models import Order, OrderStatusEvent


@receiver(post_save, sender=Order)
def record_status_event(sender, instance: Order, created: bool, **kwargs) -> None:
    last = instance.events.order_by("-created_at", "-id").values_list("status", flat=True).first()
    if last != instance.status:
        OrderStatusEvent.objects.create(order=instance, status=instance.status)
