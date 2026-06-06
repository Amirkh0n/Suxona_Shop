from rest_framework.permissions import SAFE_METHODS, BasePermission


class ReadOnly(BasePermission):
    """Allow only safe (read-only) HTTP methods."""

    def has_permission(self, request, view) -> bool:
        return request.method in SAFE_METHODS

    def has_object_permission(self, request, view, obj) -> bool:
        return request.method in SAFE_METHODS


class IsAuthenticatedUser(BasePermission):
    """Require an authenticated user."""

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        return bool(request.user and request.user.is_authenticated)


class IsAdmin(BasePermission):
    """Require an authenticated staff user."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )

    def has_object_permission(self, request, view, obj) -> bool:
        return self.has_permission(request, view)
