"""Driver profile routes."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.driver import Driver
from app.models.user import User, UserRole
from app.routes.deps import get_current_user, require_role

router = APIRouter()


class DriverResponse(BaseModel):
    id: int
    user_id: int
    vehicle_number: str
    vehicle_type: str
    is_available: bool
    rating: float

    class Config:
        from_attributes = True


class DriverCreateRequest(BaseModel):
    vehicle_number: str
    vehicle_type: str


@router.post("/", response_model=DriverResponse, status_code=201)
def create_driver_profile(
    payload: DriverCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.driver, UserRole.admin)),
):
    existing = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Driver profile already exists")
    driver = Driver(
        user_id=current_user.id,
        vehicle_number=payload.vehicle_number,
        vehicle_type=payload.vehicle_type,
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


@router.get("/available", response_model=List[DriverResponse])
def available_drivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Driver).filter(Driver.is_available.is_(True)).all()


@router.get("/{driver_id}", response_model=DriverResponse)
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    return driver
