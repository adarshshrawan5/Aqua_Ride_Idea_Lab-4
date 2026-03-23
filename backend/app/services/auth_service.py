"""Authentication service – register and login."""

from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.utils.security import hash_password, verify_password
from app.utils.jwt import create_access_token
from fastapi import HTTPException, status


def register_user(db: Session, email: str, full_name: str, password: str, role: UserRole = UserRole.user) -> User:
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(email=email, full_name=full_name, hashed_password=hash_password(password), role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> str:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return token
