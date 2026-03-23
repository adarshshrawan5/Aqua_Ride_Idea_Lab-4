"""Geolocation utilities using geopy."""

from geopy.distance import geodesic


def haversine_distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return the great-circle distance in kilometres between two GPS points."""
    return geodesic((lat1, lng1), (lat2, lng2)).km


def estimate_fare(distance_km: float, base_fare: float = 50.0, per_km_rate: float = 15.0) -> float:
    """Calculate a simple fare estimate based on distance."""
    return round(base_fare + per_km_rate * distance_km, 2)
