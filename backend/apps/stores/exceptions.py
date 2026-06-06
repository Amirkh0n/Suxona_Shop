from apps.common.exceptions import ServiceError


class StoreServiceError(ServiceError):
    default_message = "Store service error."


class UserAlreadyHasStoreError(StoreServiceError):
    default_message = "User already has a store."


class StoreApplicationNotFound(StoreServiceError):
    default_message = "Store application was not found."


class PendingStoreApplicationExistsError(StoreServiceError):
    default_message = "User already has a pending store application."


class InvalidStoreApplicationStatusError(StoreServiceError):
    default_message = "Store application status does not allow this action."


class StoreNotFound(StoreServiceError):
    default_message = "Store was not found."


class NotStoreOwnerError(StoreServiceError):
    default_message = "You do not own this store."


class DeliveryZoneNotFound(StoreServiceError):
    default_message = "Delivery zone was not found."


class DuplicateDeliveryZoneError(StoreServiceError):
    default_message = "This store already has a delivery zone for this village."


class InvalidDeliveryPriceError(StoreServiceError):
    default_message = "Delivery price must be greater than or equal to zero."


class VillageNotFound(StoreServiceError):
    default_message = "Village was not found."


class DuplicateVillageError(StoreServiceError):
    default_message = "A village with this name and district already exists."


class VillageInUseError(StoreServiceError):
    default_message = "Village is referenced by other records and cannot be deleted."
