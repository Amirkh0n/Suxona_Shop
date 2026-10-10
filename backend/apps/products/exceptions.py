from apps.common.exceptions import ServiceError


class ProductServiceError(ServiceError):
    default_message = "Product service error."


# --- Store / ownership ---------------------------------------------------

class StoreNotFound(ProductServiceError):
    default_message = "Store was not found for this user."


class StoreNotActiveError(ProductServiceError):
    default_message = "Store must be active to manage products."


class ProductNotFound(ProductServiceError):
    default_message = "Product was not found."


class DuplicateProductError(ProductServiceError):
    default_message = "A product with this name already exists in the store."


class NotProductOwnerError(ProductServiceError):
    default_message = "You do not own this product."


class InvalidProductStatusError(ProductServiceError):
    default_message = "Invalid product status."


class ProductVariantNotFound(ProductServiceError):
    default_message = "Product variant was not found."


class DuplicateProductVariantError(ProductServiceError):
    default_message = "A variant with this SKU or attributes already exists."


class InvalidProductVariantError(ProductServiceError):
    default_message = "Variant attributes must be a non-empty object."


# --- Category ------------------------------------------------------------

class CategoryNotFound(ProductServiceError):
    default_message = "Category was not found."


class DuplicateCategoryError(ProductServiceError):
    default_message = "A category with this name already exists at this level."


class InvalidCategoryParentError(ProductServiceError):
    default_message = "A category cannot be its own parent."


class CategoryHasChildrenError(ProductServiceError):
    default_message = "Category has child categories and cannot be deleted."


class CategoryInUseError(ProductServiceError):
    default_message = "Category is used by products and cannot be deleted."


# --- Product image -------------------------------------------------------

class ProductImageNotFound(ProductServiceError):
    default_message = "Product image was not found."


class MaxImagesError(ProductServiceError):
    default_message = "A product can have at most 5 images."


class MinImagesError(ProductServiceError):
    default_message = "A product must keep at least 1 image."


class InvalidImageOrderError(ProductServiceError):
    default_message = "Reorder list must contain exactly the product's image ids."
