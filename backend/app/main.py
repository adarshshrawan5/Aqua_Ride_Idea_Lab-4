"""AquaRide – FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import auth, bookings, tracking, chat, admin, drivers
from app.websockets import tracking_ws, chat_ws

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AquaRide API",
    description="Backend API for AquaRide – ride-booking platform with real-time GPS tracking and live chat.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(tracking.router, prefix="/api/tracking", tags=["Tracking"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(drivers.router, prefix="/api/drivers", tags=["Drivers"])

# WebSocket routes
app.include_router(tracking_ws.router, prefix="/ws", tags=["WebSocket – Tracking"])
app.include_router(chat_ws.router, prefix="/ws", tags=["WebSocket – Chat"])


@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "AquaRide API"}
