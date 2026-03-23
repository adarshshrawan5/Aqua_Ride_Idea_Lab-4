"""Tracking service – update and retrieve driver location."""

from datetime import datetime, timezone

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.driver import Driver


def update_driver_location(db: Session, driver_id: int, lat: float, lon: float) -> Driver:
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    driver.current_lat = lat
    driver.current_lon = lon
    driver.last_location_update = datetime.now(timezone.utc)
    db.commit()
    db.refresh(driver)
    return driver


def get_driver_location(db: Session, driver_id: int) -> dict:
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    return {
        "driver_id": driver.id,
        "lat": driver.current_lat,
        "lon": driver.current_lon,
        "last_update": driver.last_location_update,
    }
