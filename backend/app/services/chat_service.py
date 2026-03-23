"""Chat service – persist and retrieve messages."""

from sqlalchemy.orm import Session

from app.models.chat import ChatMessage


def save_message(db: Session, booking_id: int, sender_id: int, message: str) -> ChatMessage:
    msg = ChatMessage(booking_id=booking_id, sender_id=sender_id, message=message)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_messages(db: Session, booking_id: int):
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.booking_id == booking_id)
        .order_by(ChatMessage.created_at)
        .all()
    )
