from django.db import models


class ProductStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    ACTIVE = "ACTIVE", "Active"
    OUT_OF_STOCK = "OUT_OF_STOCK", "Out of stock"
    HIDDEN = "HIDDEN", "Hidden"
