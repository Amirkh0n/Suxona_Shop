from django.conf import settings
from django.db import models


class StockSubscription(models.Model):
    """"Tell me when it is back": one-shot subscription, removed once the alert is sent."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="stock_subscriptions"
    )
    product = models.ForeignKey(
        "products.Product", on_delete=models.CASCADE, related_name="stock_subscriptions"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "product"], name="stocksub_user_product_uniq")
        ]

    def __str__(self) -> str:
        return f"{self.user_id} -> {self.product_id}"
