"""Chat routes – persist and retrieve messages for a booking."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import Booking, ChatMessage, User
from app.utils.dependencies import get_current_user

router = APIRouter()


class MessageCreate(BaseModel):
    content: str


@router.post("/{booking_id}/messages", status_code=status.HTTP_201_CREATED)
def send_message(
    booking_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    msg = ChatMessage(
        booking_id=booking_id,
        sender_id=current_user.id,
        content=payload.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.get("/{booking_id}/messages")
def get_messages(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return db.query(ChatMessage).filter(ChatMessage.booking_id == booking_id).order_by(ChatMessage.created_at).all()
