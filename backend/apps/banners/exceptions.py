from apps.common.exceptions import ServiceError


class BannerServiceError(ServiceError):
    default_message = "Banner service error."


class BannerNotFound(BannerServiceError):
    default_message = "Banner was not found."


class InvalidSortOrderError(BannerServiceError):
    default_message = "Sort order must be greater than or equal to zero."
