from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.enums import ProductStatus
from apps.common.exceptions import ServiceError
from apps.common.permissions import IsSeller, IsStoreOwner
from apps.common.schema import DetailSerializer
from apps.products.exceptions import (
    CategoryNotFound,
    DuplicateProductError,
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


@extend_schema(tags=["Products"])
class ProductListCreateView(PaginatedAPIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsSeller()]
        return [AllowAny()]

    @extend_schema(
        operation_id="products_list",
        summary="List products",
        parameters=[
            OpenApiParameter("search", str, description="Search by name/description."),
            OpenApiParameter("category", int, description="Filter by category id."),
            OpenApiParameter("store", int, description="Filter by store id."),
            OpenApiParameter("categories", str, description="Comma-separated category ids."),
            OpenApiParameter(
                "on_sale", bool, description="Only discounted products (old_price > price)."
            ),
            OpenApiParameter("in_stock", bool, description="Hide sold-out products."),
            OpenApiParameter("min_price", float),
            OpenApiParameter("max_price", float),
            OpenApiParameter(
                "ordering",
                str,
                enum=["new", "price_asc", "price_desc", "popular", "discount", "rating"],
            ),
        ],
        responses={200: ProductListSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        q = request.query_params
        category_ids = []
        for raw in (q.get("categories", ""), q.get("category", "")):
            category_ids += [int(v) for v in raw.split(",") if v.strip().isdigit()]
        flag = lambda name: q.get(name, "").lower() in ("1", "true")  # noqa: E731

        # Public endpoint: only ACTIVE products, whatever the filters.
        products = ProductSelector.filter_public_products(
            search=q.get("search", "").strip(),
            category_ids=category_ids,
            store_id=q.get("store") if q.get("store", "").isdigit() else None,
            on_sale=flag("on_sale"),
            in_stock=flag("in_stock"),
            min_price=q.get("min_price"),
            max_price=q.get("max_price"),
            ordering=q.get("ordering", "new"),
        )

        return self.paginate(products, ProductListSerializer, request)

    @extend_schema(
        summary="Create a product (seller)",
        request=ProductCreateSerializer,
        responses={
            201: ProductDetailSerializer,
            400: OpenApiResponse(DetailSerializer, "Validation or store inactive."),
            403: OpenApiResponse(DetailSerializer, "Not the product owner."),
            404: OpenApiResponse(DetailSerializer, "Store or category not found."),
        },
    )
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
        except DuplicateProductError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        created = ProductSelector.get_product_by_id(product.pk)
        return Response(
            ProductDetailSerializer(created).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Products"])
class ProductDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ("PATCH", "DELETE"):
            return [IsStoreOwner()]
        return [AllowAny()]

    @extend_schema(
        operation_id="products_retrieve",
        summary="Get a product",
        responses={
            200: ProductDetailSerializer,
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
    )
    def get(self, request: Request, product_id: int) -> Response:
        product = ProductSelector.get_product_by_id(product_id)
        user = request.user
        is_owner_or_staff = bool(
            user
            and user.is_authenticated
            and (user.is_staff or product is not None and product.store.owner_id == user.pk)
        )
        # Drafts, products under review, rejected and hidden ones are private:
        # only the owning seller and staff may open them. OUT_OF_STOCK stays
        # reachable so old links/carts still explain what happened.
        public_statuses = (ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK)
        if product is None or (
            product.status not in public_statuses and not is_owner_or_staff
        ):
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        data = ProductDetailSerializer(product).data
        if not is_owner_or_staff:
            data.pop("moderation_note", None)
        return Response(data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update a product (store owner)",
        request=ProductUpdateSerializer,
        responses={
            200: ProductDetailSerializer,
            400: OpenApiResponse(DetailSerializer, "Validation or service error."),
            403: OpenApiResponse(DetailSerializer, "Not the product owner."),
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
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
        except DuplicateProductError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        updated = ProductSelector.get_product_by_id(product.pk)
        return Response(
            ProductDetailSerializer(updated).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Delete a product (store owner)",
        responses={
            204: OpenApiResponse(description="Deleted."),
            403: OpenApiResponse(DetailSerializer, "Not the product owner."),
            404: OpenApiResponse(DetailSerializer, "Not found."),
        },
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


@extend_schema(tags=["Products"])
class SimilarProductsView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Similar products (same category)",
        responses={200: ProductListSerializer(many=True)},
    )
    def get(self, request: Request, product_id: int) -> Response:
        product = ProductSelector.get_active_product(product_id)
        if product is None:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        similar = ProductSelector.get_similar_products(product)
        return Response(ProductListSerializer(similar, many=True).data)


@extend_schema(tags=["Products"])
class MyProductsView(PaginatedAPIView):
    permission_classes = [IsSeller]

    @extend_schema(
        summary="List my store's products (seller)",
        responses={
            200: ProductListSerializer(many=True),
            404: OpenApiResponse(DetailSerializer, "Store not found."),
        },
    )
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
