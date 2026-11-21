from django.utils import timezone
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import ServiceError
from apps.common.permissions import IsAuthenticatedUser, IsSeller
from apps.common.schema import DetailSerializer
from apps.stores.exceptions import ReviewAlreadyExistsError, ReviewOrderNotFound
from apps.stores.models import StoreReview
from apps.stores.selectors import StoreSelector
from apps.stores.serializers import StoreReviewCreateSerializer, StoreReviewSerializer
from apps.stores.services import CreateStoreReviewService
from apps.stores.views.base import PaginatedAPIView


class ReviewReplySerializer(serializers.Serializer):
    reply = serializers.CharField(max_length=1000)


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


@extend_schema(tags=["Stores"])
class StoreReviewReplyView(APIView):
    """The store owner answers (POST) or removes the answer (DELETE) on a store review."""

    permission_classes = [IsSeller]

    def _review(self, request: Request, review_id: int):
        store = getattr(request, "seller_store", None) or StoreSelector.get_store_by_owner(
            request.user.id
        )
        return StoreReview.objects.filter(pk=review_id, store=store).first() if store else None

    @extend_schema(summary="Reply to a store review (seller)", request=ReviewReplySerializer)
    def post(self, request: Request, review_id: int) -> Response:
        review = self._review(request, review_id)
        if review is None:
            return Response({"detail": "Review not found."}, status=status.HTTP_404_NOT_FOUND)
        ser = ReviewReplySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        review.seller_reply = ser.validated_data["reply"].strip()
        review.seller_replied_at = timezone.now()
        review.save(update_fields=["seller_reply", "seller_replied_at", "updated_at"])
        return Response({"seller_reply": review.seller_reply})

    @extend_schema(summary="Remove my reply", responses={204: None})
    def delete(self, request: Request, review_id: int) -> Response:
        review = self._review(request, review_id)
        if review is None:
            return Response({"detail": "Review not found."}, status=status.HTTP_404_NOT_FOUND)
        review.seller_reply, review.seller_replied_at = "", None
        review.save(update_fields=["seller_reply", "seller_replied_at", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)
