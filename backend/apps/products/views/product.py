from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import ServiceError
from apps.common.permissions import IsSeller, IsStoreOwner
from apps.products.exceptions import (
    CategoryNotFound,
    NotProductOwnerError,
    ProductNotFound,
    StoreNotActiveError,
    StoreNotFound,
)
from apps.products.selectors import ProductSelector
from apps.products.serializers import (
    ProductCreateSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductUpdateSerializer,
)
from apps.products.services import (
    CreateProductService,
    DeleteProductService,
    UpdateProductService,
)
from apps.products.views.base import PaginatedAPIView
from apps.stores.selectors import StoreSelector


class ProductListCreateView(PaginatedAPIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsSeller()]
        return [AllowAny()]

    def get(self, request: Request) -> Response:
        category = request.query_params.get("category")
        store = request.query_params.get("store")
        search = request.query_params.get("search")

        if search:
            products = ProductSelector.search_products(search)
        elif category:
            products = ProductSelector.get_products_by_category(category)
        elif store:
            products = ProductSelector.get_store_products(store)
        else:
            products = ProductSelector.get_active_products()

        return self.paginate(products, ProductListSerializer, request)

    def post(self, request: Request) -> Response:
        store = getattr(request, "seller_store", None) or (
            StoreSelector.get_store_by_owner(request.user.id)
        )
        if store is None:
            return Response(
                {"detail": "Store not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ProductCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            product = CreateProductService.execute(
                store=store,
                actor=request.user,
                **serializer.validated_data,
            )
        except (StoreNotFound, CategoryNotFound) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except NotProductOwnerError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except StoreNotActiveError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        created = ProductSelector.get_product_by_id(product.pk)
        return Response(
            ProductDetailSerializer(created).data,
            status=status.HTTP_201_CREATED,
        )


class ProductDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ("PATCH", "DELETE"):
            return [IsStoreOwner()]
        return [AllowAny()]

    def get(self, request: Request, product_id: int) -> Response:
        product = ProductSelector.get_product_by_id(product_id)
        if product is None:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            ProductDetailSerializer(product).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request: Request, product_id: int) -> Response:
        product = ProductSelector.get_product_by_id(product_id)
        if product is None:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        self.check_object_permissions(request, product)

        serializer = ProductUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            product = UpdateProductService.execute(
                product=product,
                actor=request.user,
                **serializer.validated_data,
            )
        except (ProductNotFound, CategoryNotFound) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except NotProductOwnerError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        updated = ProductSelector.get_product_by_id(product.pk)
        return Response(
            ProductDetailSerializer(updated).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request: Request, product_id: int) -> Response:
        product = ProductSelector.get_product_by_id(product_id)
        if product is None:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        self.check_object_permissions(request, product)

        try:
            DeleteProductService.execute(product=product, actor=request.user)
        except ProductNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except NotProductOwnerError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)


class MyProductsView(PaginatedAPIView):
    permission_classes = [IsSeller]

    def get(self, request: Request) -> Response:
        store = getattr(request, "seller_store", None) or (
            StoreSelector.get_store_by_owner(request.user.id)
        )
        if store is None:
            return Response(
                {"detail": "Store not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        products = ProductSelector.get_store_products(store.id)
        return self.paginate(products, ProductListSerializer, request)
