from apps.common.exceptions import ServiceError


class OrderServiceError(ServiceError):
    default_message = "Order service error."


class OrderNotFound(OrderServiceError):
    default_message = "Order was not found."


class CartNotFoundError(OrderServiceError):
    default_message = "Cart was not found for this customer."


class StoreNotActiveError(OrderServiceError):
    default_message = "Store is not active."


class ProductNotActiveError(OrderServiceError):
    default_message = "One or more products are not active."


class InsufficientStockError(OrderServiceError):
    default_message = "Insufficient stock for one or more products."


class EmptyStoreCartError(OrderServiceError):
    default_message = "Cart has no items for the selected store."


class AddressOwnershipError(OrderServiceError):
    default_message = "Address does not belong to this customer."


class DeliveryZoneNotFoundError(OrderServiceError):
    default_message = "Store does not deliver to this address village."


class InvalidOrderStatusError(OrderServiceError):
    default_message = "Order status does not allow this action."


class CartItemNotFound(OrderServiceError):
    default_message = "Cart item was not found."


class NotCartOwnerError(OrderServiceError):
    default_message = "This cart item does not belong to you."


class NotOrderOwnerError(OrderServiceError):
    default_message = "This order does not belong to you."


class ProductNotPurchasable(OrderServiceError):
    default_message = "Product is not available for purchase."


class ProductVariantNotPurchasable(OrderServiceError):
    default_message = "Product variant is not available for purchase."


class ProductVariantMismatchError(OrderServiceError):
    default_message = "Product variant does not belong to the selected product."


class InvalidQuantityError(OrderServiceError):
    default_message = "Quantity must be greater than zero."
