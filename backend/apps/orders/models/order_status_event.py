from django.db import models


class OrderStatusEvent(models.Model):
    """One row per status an order has been in; powers the customer's timeline."""

    order = models.ForeignKey("orders.Order", on_delete=models.CASCADE, related_name="events")
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]
        indexes = [models.Index(fields=["order", "created_at"], name="orderevent_order_idx")]

    def __str__(self) -> str:
        return f"{self.order_id}: {self.status}"
