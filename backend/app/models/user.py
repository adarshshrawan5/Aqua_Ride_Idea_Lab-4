"""SQLAlchemy User model."""

import enum
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Integer, String, Boolean
from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"
    driver = "driver"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
