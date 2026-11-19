from django.conf import settings
from django.db import models
from django.db.models import Q

from apps.common.enums import DeliveryMethod, OrderStatus
from apps.common.models import BaseModel


class Order(BaseModel):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
    )
    store = models.ForeignKey(
        "stores.Store",
        on_delete=models.PROTECT,
        related_name="orders",
    )
    # Null for PICKUP orders.
    address = models.ForeignKey(
        "accounts.Address",
        on_delete=models.PROTECT,
        related_name="orders",
        null=True,
        blank=True,
    )
    delivery_method = models.CharField(
        max_length=10,
        choices=DeliveryMethod.choices,
        default=DeliveryMethod.DELIVERY,
    )
    # Who to call for this order; defaults to the customer's own details.
    contact_name = models.CharField(max_length=255, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    delivery_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
    )
    note = models.TextField(blank=True)

    class Meta:
        verbose_name = "Buyurtma"
        verbose_name_plural = "Buyurtmalar"
        indexes = [
            models.Index(fields=["customer"], name="order_customer_idx"),
            models.Index(fields=["store"], name="order_store_idx"),
            models.Index(fields=["address"], name="order_address_idx"),
            models.Index(fields=["status"], name="order_status_idx"),
            models.Index(fields=["created_at"], name="order_created_idx"),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(delivery_price__gte=0),
                name="order_delivery_price_non_negative",
            ),
            models.CheckConstraint(
                condition=Q(subtotal__gte=0),
                name="order_subtotal_non_negative",
            ),
            models.CheckConstraint(
                condition=Q(total__gte=0),
                name="order_total_non_negative",
            ),
        ]

    def __str__(self) -> str:
        return f"Order #{self.pk}"
