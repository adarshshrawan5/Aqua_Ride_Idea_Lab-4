"""AquaRide FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import auth, bookings, drivers, tracking, chat
from app.websockets.manager import websocket_router

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AquaRide API",
    description="Backend API for AquaRide – real-time water-ride booking platform",
    version="1.0.0",
)

# CORS – adjust origins before deploying to production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(drivers.router, prefix="/api/drivers", tags=["drivers"])
app.include_router(tracking.router, prefix="/api/tracking", tags=["tracking"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

# WebSocket router
app.include_router(websocket_router)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "service": "AquaRide API"}
