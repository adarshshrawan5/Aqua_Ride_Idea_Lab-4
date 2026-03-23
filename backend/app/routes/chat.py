"""Chat history REST routes."""

from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routes.deps import get_current_user
from app.services.chat_service import get_messages

router = APIRouter()


class MessageResponse(BaseModel):
    id: int
    booking_id: int
    sender_id: int
    message: str

    class Config:
        from_attributes = True


@router.get("/{booking_id}/messages", response_model=List[MessageResponse])
def list_messages(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_messages(db, booking_id)
