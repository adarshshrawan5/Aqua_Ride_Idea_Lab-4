"""Admin routes – manage users and view all bookings."""

from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.booking import Booking, BookingStatus
from app.routes.deps import require_role

router = APIRouter()


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True


class BookingAdminResponse(BaseModel):
    id: int
    user_id: int
    driver_id: int | None
    status: BookingStatus
    fare_estimate: float | None

    class Config:
        from_attributes = True


@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin)),
):
    return db.query(User).all()


@router.get("/bookings", response_model=List[BookingAdminResponse])
def list_all_bookings(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin)),
):
    return db.query(Booking).all()


@router.patch("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin)),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = False
    db.commit()
    return {"detail": "User deactivated"}
