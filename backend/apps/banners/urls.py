from django.urls import path

from apps.banners.views import BannerDetailView, BannerListCreateView


app_name = "banners"

urlpatterns = [
    path("", BannerListCreateView.as_view(), name="banner-list"),
    path("<int:banner_id>", BannerDetailView.as_view(), name="banner-detail"),
]
