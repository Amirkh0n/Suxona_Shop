from django.urls import path

from apps.products.views import (
    CategoryDetailView,
    CategoryListCreateView,
    FavoriteIdsView,
    FavoriteListView,
    FavoriteToggleView,
    MyProductsView,
    ProductDetailView,
    ProductImageDeleteView,
    ProductImageListUploadView,
    ProductImageReorderView,
    ProductListCreateView,
    ProductReviewListCreateView,
    ProductVariantDetailView,
    ProductVariantListCreateView,
    SimilarProductsView,
)

app_name = "products"

urlpatterns = [
    # Favorites
    path("favorites", FavoriteListView.as_view(), name="favorite-list"),
    path("favorites/ids", FavoriteIdsView.as_view(), name="favorite-ids"),
    path(
        "products/<int:product_id>/favorite",
        FavoriteToggleView.as_view(),
        name="favorite-toggle",
    ),
    # Products
    path("products", ProductListCreateView.as_view(), name="product-list"),
    path("products/my", MyProductsView.as_view(), name="product-my"),
    path(
        "products/<int:product_id>",
        ProductDetailView.as_view(),
        name="product-detail",
    ),
    path(
        "products/<int:product_id>/similar",
        SimilarProductsView.as_view(),
        name="product-similar",
    ),
    path(
        "products/<int:product_id>/reviews",
        ProductReviewListCreateView.as_view(),
        name="product-reviews",
    ),
    # Product images
    path(
        "products/<int:product_id>/images",
        ProductImageListUploadView.as_view(),
        name="product-image-list",
    ),
    path(
        "products/<int:product_id>/images/reorder",
        ProductImageReorderView.as_view(),
        name="product-image-reorder",
    ),
    path(
        "product-images/<int:image_id>",
        ProductImageDeleteView.as_view(),
        name="product-image-delete",
    ),
    path(
        "products/<int:product_id>/variants",
        ProductVariantListCreateView.as_view(),
        name="product-variant-list-create",
    ),
    path(
        "product-variants/<int:variant_id>",
        ProductVariantDetailView.as_view(),
        name="product-variant-detail",
    ),
    # Categories
    path("categories", CategoryListCreateView.as_view(), name="category-list"),
    path(
        "categories/<int:category_id>",
        CategoryDetailView.as_view(),
        name="category-detail",
    ),
]
