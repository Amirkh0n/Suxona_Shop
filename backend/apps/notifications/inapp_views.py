from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsAuthenticatedUser
from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "kind", "title", "body", "link", "is_read", "created_at"]
        read_only_fields = fields


@extend_schema(tags=["Notifications"])
class NotificationListView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(summary="My notifications", responses={200: NotificationSerializer(many=True)})
    def get(self, request: Request) -> Response:
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(
            Notification.objects.filter(user=request.user), request, view=self
        )
        return paginator.get_paginated_response(NotificationSerializer(page, many=True).data)


@extend_schema(tags=["Notifications"])
class NotificationUnreadCountView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(summary="Number of unread notifications")
    def get(self, request: Request) -> Response:
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"count": count})


@extend_schema(tags=["Notifications"])
class NotificationReadAllView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(summary="Mark all as read", responses={204: None})
    def post(self, request: Request) -> Response:
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(tags=["Notifications"])
class NotificationReadView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(summary="Mark one as read", responses={204: None})
    def post(self, request: Request, notification_id: int) -> Response:
        Notification.objects.filter(user=request.user, pk=notification_id).update(is_read=True)
        return Response(status=status.HTTP_204_NO_CONTENT)
