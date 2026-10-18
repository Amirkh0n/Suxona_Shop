from django.db import models


class ProductStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    # Seller submitted it; waiting for an admin decision. Not public.
    PENDING_REVIEW = "PENDING_REVIEW", "Pending review"
    ACTIVE = "ACTIVE", "Active"
    # Admin refused it; see Product.moderation_note. Seller may fix and resubmit.
    REJECTED = "REJECTED", "Rejected"
    OUT_OF_STOCK = "OUT_OF_STOCK", "Out of stock"
    HIDDEN = "HIDDEN", "Hidden"
