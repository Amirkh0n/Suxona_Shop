from django.conf import settings
from django.db import models


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites"
    )
    product = models.ForeignKey(
        "products.Product", on_delete=models.CASCADE, related_name="favorites"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "favorites"
        constraints = [
            models.UniqueConstraint(fields=["user", "product"], name="favorite_user_product_uniq")
        ]
        indexes = [models.Index(fields=["user", "-created_at"], name="favorite_user_created_idx")]

    def __str__(self) -> str:
        return f"{self.user_id} ♥ {self.product_id}"
