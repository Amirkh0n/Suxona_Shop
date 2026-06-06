from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAdmin
from apps.products.exceptions import (
    CategoryHasChildrenError,
    CategoryInUseError,
    CategoryNotFound,
    DuplicateCategoryError,
    InvalidCategoryParentError,
)
from apps.products.selectors import CategorySelector
from apps.products.serializers import (
    CategoryCreateSerializer,
    CategorySerializer,
    CategoryUpdateSerializer,
)
from apps.products.services import (
    CreateCategoryService,
    DeleteCategoryService,
    UpdateCategoryService,
)
from apps.products.views.base import PaginatedAPIView


class CategoryListCreateView(PaginatedAPIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request: Request) -> Response:
        categories = CategorySelector.get_active_categories()
        return self.paginate(categories, CategorySerializer, request)

    def post(self, request: Request) -> Response:
        serializer = CategoryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            category = CreateCategoryService.execute(**serializer.validated_data)
        except CategoryNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except (DuplicateCategoryError, InvalidCategoryParentError) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            CategorySerializer(category).data,
            status=status.HTTP_201_CREATED,
        )


class CategoryDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ("PATCH", "DELETE"):
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request: Request, category_id: int) -> Response:
        category = CategorySelector.get_category_by_id(category_id)
        if category is None or (
            not category.is_active and not request.user.is_staff
        ):
            return Response(
                {"detail": "Category not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            CategorySerializer(category).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request: Request, category_id: int) -> Response:
        category = CategorySelector.get_category_by_id(category_id)
        if category is None:
            return Response(
                {"detail": "Category not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CategoryUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            category = UpdateCategoryService.execute(
                category=category,
                **serializer.validated_data,
            )
        except CategoryNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except (DuplicateCategoryError, InvalidCategoryParentError) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            CategorySerializer(category).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request: Request, category_id: int) -> Response:
        category = CategorySelector.get_category_by_id(category_id)
        if category is None:
            return Response(
                {"detail": "Category not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            DeleteCategoryService.execute(category=category)
        except CategoryNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except (CategoryHasChildrenError, CategoryInUseError) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)
