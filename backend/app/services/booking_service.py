"""Booking service – create, update, fetch bookings."""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.booking import Booking, BookingStatus
from app.models.driver import Driver
from app.utils.geo import haversine_km

FARE_PER_KM = 2.5
BASE_FARE = 5.0


def create_booking(
    db: Session,
    user_id: int,
    pickup_address: str,
    pickup_lat: float,
    pickup_lon: float,
    dropoff_address: str,
    dropoff_lat: float,
    dropoff_lon: float,
) -> Booking:
    distance_km = haversine_km(pickup_lat, pickup_lon, dropoff_lat, dropoff_lon)
    fare = BASE_FARE + distance_km * FARE_PER_KM
    booking = Booking(
        user_id=user_id,
        pickup_address=pickup_address,
        pickup_lat=pickup_lat,
        pickup_lon=pickup_lon,
        dropoff_address=dropoff_address,
        dropoff_lat=dropoff_lat,
        dropoff_lon=dropoff_lon,
        fare_estimate=round(fare, 2),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def get_user_bookings(db: Session, user_id: int):
    return db.query(Booking).filter(Booking.user_id == user_id).all()


def get_booking(db: Session, booking_id: int) -> Booking:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return booking


def update_booking_status(db: Session, booking_id: int, new_status: BookingStatus, driver_id: int = None) -> Booking:
    booking = get_booking(db, booking_id)
    booking.status = new_status
    if driver_id is not None:
        booking.driver_id = driver_id
    db.commit()
    db.refresh(booking)
    return booking
