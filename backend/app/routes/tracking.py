"""Tracking routes – fetch current driver GPS position for a booking."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Booking, Driver
from app.utils.dependencies import get_current_user
from app.models.models import User

router = APIRouter()


@router.get("/{booking_id}")
def get_driver_location(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id and current_user.role not in ("admin", "driver"):
        raise HTTPException(status_code=403, detail="Access denied")
    if not booking.driver_id:
        return {"latitude": None, "longitude": None, "message": "No driver assigned yet"}
    driver = db.query(Driver).filter(Driver.id == booking.driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {
        "driver_id": driver.id,
        "latitude": driver.latitude,
        "longitude": driver.longitude,
        "is_available": driver.is_available,
    }
