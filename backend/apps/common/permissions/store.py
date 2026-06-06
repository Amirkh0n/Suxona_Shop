from rest_framework.permissions import BasePermission

from apps.common.enums import StoreStatus
from apps.common.permissions.helpers import resolve_store_owner_id
from apps.stores.selectors import StoreSelector


class IsSeller(BasePermission):
    """Require that the user owns an ACTIVE store.

    On success the resolved store is cached on the request as
    ``request.seller_store`` so views can reuse it without re-querying.
    """

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not (user and user.is_authenticated):
            return False

        store = StoreSelector.get_store_by_owner(user.id)
        if store is not None and store.status == StoreStatus.ACTIVE:
            request.seller_store = store
            return True
        return False

    def has_object_permission(self, request, view, obj) -> bool:
        return self.has_permission(request, view)


class IsStoreOwner(BasePermission):
    """Require that the user owns the store related to the object."""

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user
        if not (user and user.is_authenticated):
            return False

        owner_id = resolve_store_owner_id(obj)
        return owner_id is not None and owner_id == user.id


class IsStoreOwnerOrAdmin(BasePermission):
    """Require that the user owns the related store, or is an admin."""

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user
        if not (user and user.is_authenticated):
            return False

        if user.is_staff:
            return True

        owner_id = resolve_store_owner_id(obj)
        return owner_id is not None and owner_id == user.id
