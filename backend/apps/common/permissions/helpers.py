from apps.stores.models import Store
from apps.stores.selectors import StoreSelector


def resolve_store_owner_id(obj) -> int | None:
    """Return the owner id of the store related to ``obj``.

    Supports objects that are a ``Store`` directly, or that expose a
    ``store_id`` foreign key (e.g. Product, DeliveryZone, Order).
    Store lookups are delegated to ``StoreSelector`` (read-only).
    """
    if isinstance(obj, Store):
        return obj.owner_id

    store_id = getattr(obj, "store_id", None)
    if store_id is None:
        return None

    store = StoreSelector.get_store_by_id(store_id)
    return store.owner_id if store is not None else None
