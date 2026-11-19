from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAuthenticatedUser
from apps.common.schema import DetailSerializer
from apps.stores.exceptions import ReviewAlreadyExistsError, ReviewOrderNotFound
from apps.stores.models import StoreReview
from apps.stores.selectors import StoreSelector
from apps.stores.serializers import StoreReviewCreateSerializer, StoreReviewSerializer
from apps.stores.services import CreateStoreReviewService
from apps.stores.views.base import PaginatedAPIView


@extend_schema(tags=["Stores"])
class StoreReviewListView(PaginatedAPIView):
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="store_reviews_list",
        summary="List a store's reviews (newest first)",
        responses={200: StoreReviewSerializer(many=True)},
    )
    def get(self, request: Request, store_id: int) -> Response:
        if StoreSelector.get_active_store_by_id(store_id) is None:
            return Response({"detail": "Store not found."}, status=status.HTTP_404_NOT_FOUND)
        reviews = StoreReview.objects.filter(store_id=store_id).select_related("customer")
        return self.paginate(reviews, StoreReviewSerializer, request)


@extend_schema(tags=["Orders"])
class OrderReviewCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    @extend_schema(
        summary="Rate the store of a completed order (once per order)",
        request=StoreReviewCreateSerializer,
        responses={
            201: StoreReviewSerializer,
            400: OpenApiResponse(DetailSerializer, "Order not completed."),
            404: OpenApiResponse(DetailSerializer, "Order not found."),
            409: OpenApiResponse(DetailSerializer, "Already reviewed."),
        },
    )
    def post(self, request: Request, order_id: int) -> Response:
        serializer = StoreReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            review = CreateStoreReviewService.execute(
                order_id=order_id, customer=request.user, **serializer.validated_data
            )
        except ReviewOrderNotFound as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except ReviewAlreadyExistsError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        except ServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(StoreReviewSerializer(review).data, status=status.HTTP_201_CREATED)
