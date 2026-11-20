from django.contrib import admin

from apps.common.models import AuditLog
from apps.notifications.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "kind", "title", "is_read", "created_at")
    list_filter = ("kind", "is_read")
    search_fields = ("title", "user__phone")
    raw_id_fields = ("user",)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Read-only: the journal must not be editable from the admin."""

    list_display = ("created_at", "actor", "action", "target_type", "target_id", "summary")
    list_filter = ("action", "target_type")
    search_fields = ("summary", "target_id", "actor__phone")
    date_hierarchy = "created_at"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
