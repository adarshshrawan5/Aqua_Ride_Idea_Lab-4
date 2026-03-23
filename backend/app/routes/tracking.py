"""Tracking REST routes (polling fallback; prefer WebSocket)."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.routes.deps import get_current_user, require_role
from app.services.tracking_service import get_driver_location, update_driver_location

router = APIRouter()


class LocationUpdate(BaseModel):
    lat: float
    lon: float


@router.put("/driver/{driver_id}")
def set_driver_location(
    driver_id: int,
    payload: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.driver, UserRole.admin)),
):
    return update_driver_location(db, driver_id, payload.lat, payload.lon)


@router.get("/driver/{driver_id}")
def fetch_driver_location(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_driver_location(db, driver_id)
