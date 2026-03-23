"""Driver routes – registration and availability management."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.models import Driver, User
from app.utils.dependencies import get_current_user

router = APIRouter()


class DriverCreate(BaseModel):
    vehicle_type: str
    license_number: str


class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
    is_available: Optional[bool] = None


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_driver(
    payload: DriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if db.query(Driver).filter(Driver.user_id == current_user.id).first():
        raise HTTPException(status_code=400, detail="Driver profile already exists")
    driver = Driver(
        user_id=current_user.id,
        vehicle_type=payload.vehicle_type,
        license_number=payload.license_number,
        is_available=True,
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


@router.get("/available")
def list_available_drivers(db: Session = Depends(get_db)):
    return db.query(Driver).filter(Driver.is_available == True).all()  # noqa: E712


@router.patch("/location")
def update_location(
    payload: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    driver.latitude = payload.latitude
    driver.longitude = payload.longitude
    if payload.is_available is not None:
        driver.is_available = payload.is_available
    db.commit()
    db.refresh(driver)
    return driver
