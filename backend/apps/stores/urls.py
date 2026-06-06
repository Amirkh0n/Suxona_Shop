from django.urls import path

from apps.stores.views import (
    ApproveStoreApplicationView,
    DeliveryZoneCreateView,
    DeliveryZoneDetailView,
    MyStoreView,
    PendingStoreApplicationListView,
    RejectStoreApplicationView,
    StoreApplicationCreateView,
    StoreDeliveryZoneListView,
    StoreDetailView,
    StoreListView,
    VillageDetailView,
    VillageListView,
)


app_name = "stores"

urlpatterns = [
    # Stores
    path("stores", StoreListView.as_view(), name="store-list"),
    path("stores/my", MyStoreView.as_view(), name="store-my"),
    path("stores/<int:store_id>", StoreDetailView.as_view(), name="store-detail"),
    path(
        "stores/<int:store_id>/delivery-zones",
        StoreDeliveryZoneListView.as_view(),
        name="store-delivery-zones",
    ),
    # Store applications
    path(
        "store-applications",
        StoreApplicationCreateView.as_view(),
        name="store-application-create",
    ),
    # Delivery zones
    path(
        "delivery-zones",
        DeliveryZoneCreateView.as_view(),
        name="delivery-zone-create",
    ),
    path(
        "delivery-zones/<int:zone_id>",
        DeliveryZoneDetailView.as_view(),
        name="delivery-zone-detail",
    ),
    # Villages
    path("villages", VillageListView.as_view(), name="village-list"),
    path(
        "villages/<int:village_id>",
        VillageDetailView.as_view(),
        name="village-detail",
    ),
    # Admin: store applications
    path(
        "admin/store-applications",
        PendingStoreApplicationListView.as_view(),
        name="admin-store-application-list",
    ),
    path(
        "admin/store-applications/<int:application_id>/approve",
        ApproveStoreApplicationView.as_view(),
        name="admin-store-application-approve",
    ),
    path(
        "admin/store-applications/<int:application_id>/reject",
        RejectStoreApplicationView.as_view(),
        name="admin-store-application-reject",
    ),
]
