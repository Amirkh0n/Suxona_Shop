from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class PaginatedAPIView(APIView):
    """APIView base that exposes a helper for paginating selector querysets
    using the project-wide PageNumberPagination configuration."""

    pagination_class = PageNumberPagination

    def paginate(self, queryset, serializer_class, request: Request) -> Response:
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)
