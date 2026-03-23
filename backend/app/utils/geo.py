"""Distance / geo utilities."""

from geopy.distance import geodesic


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return the great-circle distance in kilometres between two coordinates."""
    return geodesic((lat1, lon1), (lat2, lon2)).km
