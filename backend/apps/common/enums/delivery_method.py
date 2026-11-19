from django.db import models


class DeliveryMethod(models.TextChoices):
    DELIVERY = "DELIVERY", "Delivery"
    # Customer collects the order at the store; no address, no delivery fee.
    PICKUP = "PICKUP", "Pickup"
