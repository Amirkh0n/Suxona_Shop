from rest_framework.permissions import BasePermission

from apps.common.permissions.helpers import resolve_store_owner_id


class IsOrderOwner(BasePermission):
    """Require that the user is the customer who owns the order."""

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user
        if not (user and user.is_authenticated):
            return False

        return getattr(obj, "customer_id", None) == user.id


class IsOrderOwnerOrStoreOwner(BasePermission):
    """Require that the user is the order's customer, the seller who owns
    the order's store, or an admin."""

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user
        if not (user and user.is_authenticated):
            return False

        if user.is_staff:
            return True

        if getattr(obj, "customer_id", None) == user.id:
            return True

        owner_id = resolve_store_owner_id(obj)
        return owner_id is not None and owner_id == user.id
