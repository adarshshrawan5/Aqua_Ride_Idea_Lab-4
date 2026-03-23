"""Booking routes – create, list, and update ride bookings."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.models import Booking, BookingStatus, User
from app.utils.dependencies import get_current_user, require_role
from app.utils.geo import estimate_fare, haversine_distance_km

router = APIRouter()


class BookingCreate(BaseModel):
    pickup_lat: float
    pickup_lng: float
    dropoff_lat: float
    dropoff_lng: float

    @field_validator("pickup_lat", "dropoff_lat")
    @classmethod
    def validate_latitude(cls, v: float) -> float:
        if not -90 <= v <= 90:
            raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator("pickup_lng", "dropoff_lng")
    @classmethod
    def validate_longitude(cls, v: float) -> float:
        if not -180 <= v <= 180:
            raise ValueError("Longitude must be between -180 and 180")
        return v


class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    driver_id: Optional[int] = None


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    distance = haversine_distance_km(
        payload.pickup_lat, payload.pickup_lng,
        payload.dropoff_lat, payload.dropoff_lng,
    )
    fare = estimate_fare(distance)
    booking = Booking(
        user_id=current_user.id,
        pickup_lat=payload.pickup_lat,
        pickup_lng=payload.pickup_lng,
        dropoff_lat=payload.dropoff_lat,
        dropoff_lng=payload.dropoff_lng,
        fare=fare,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/")
def list_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "admin":
        return db.query(Booking).all()
    return db.query(Booking).filter(Booking.user_id == current_user.id).all()


@router.get("/{booking_id}")
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.role not in ("admin", "driver") and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return booking


@router.patch("/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = payload.status
    if payload.driver_id is not None:
        booking.driver_id = payload.driver_id
    db.commit()
    db.refresh(booking)
    return booking
