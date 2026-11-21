"""Great-circle distance sorting for the "nearby stores" list."""

from math import asin, cos, radians, sin, sqrt


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    dlat, dlng = radians(lat2 - lat1), radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    return 2 * 6371.0 * asin(sqrt(a))


def nearest_first(stores, lat: float, lng: float) -> list:
    """Annotate ``distance_km`` and sort ascending; stores without coordinates go last."""
    stores = list(stores)
    for store in stores:
        has_pos = store.latitude is not None and store.longitude is not None
        store.distance_km = (
            haversine_km(lat, lng, float(store.latitude), float(store.longitude))
            if has_pos
            else None
        )
    return sorted(stores, key=lambda s: (s.distance_km is None, s.distance_km or 0))
