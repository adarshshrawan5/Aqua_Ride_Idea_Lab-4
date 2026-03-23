"""Booking routes."""

from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import BookingStatus
from app.models.user import User, UserRole
from app.routes.deps import get_current_user, require_role
from app.services.booking_service import (
    create_booking,
    get_booking,
    get_user_bookings,
    update_booking_status,
)

router = APIRouter()


class BookingCreateRequest(BaseModel):
    pickup_address: str
    pickup_lat: float
    pickup_lon: float
    dropoff_address: str
    dropoff_lat: float
    dropoff_lon: float


class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    driver_id: Optional[int] = None


class BookingResponse(BaseModel):
    id: int
    user_id: int
    driver_id: Optional[int]
    pickup_address: str
    dropoff_address: str
    status: BookingStatus
    fare_estimate: Optional[float]

    class Config:
        from_attributes = True


@router.post("/", response_model=BookingResponse, status_code=201)
def book_ride(
    payload: BookingCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.user, UserRole.admin)),
):
    return create_booking(
        db,
        current_user.id,
        payload.pickup_address,
        payload.pickup_lat,
        payload.pickup_lon,
        payload.dropoff_address,
        payload.dropoff_lat,
        payload.dropoff_lon,
    )


@router.get("/", response_model=List[BookingResponse])
def list_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_bookings(db, current_user.id)


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_detail(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_booking(db, booking_id)


@router.patch("/{booking_id}/status", response_model=BookingResponse)
def update_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.driver, UserRole.admin)),
):
    return update_booking_status(db, booking_id, payload.status, payload.driver_id)
