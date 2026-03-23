"""Authentication routes."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import UserRole
from app.services.auth_service import authenticate_user, register_user

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.user


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    register_user(db, payload.email, payload.full_name, payload.password, payload.role)
    token = authenticate_user(db, payload.email, payload.password)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    token = authenticate_user(db, payload.email, payload.password)
    return TokenResponse(access_token=token)
