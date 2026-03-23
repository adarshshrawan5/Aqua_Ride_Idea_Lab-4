"""SQLAlchemy Driver model."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from app.database import Base


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    vehicle_number = Column(String, nullable=False)
    vehicle_type = Column(String, nullable=False)
    is_available = Column(Boolean, default=True)
    current_lat = Column(Float, nullable=True)
    current_lon = Column(Float, nullable=True)
    last_location_update = Column(DateTime(timezone=True), nullable=True)
    rating = Column(Float, default=5.0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
